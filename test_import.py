import pdfplumber
import json
import re
import time
import random

def generate_id(prefix):
    return f"{prefix}-{int(time.time() * 1000)}-{random.randint(1000, 9999)}"

def apply_bold_tags_regex(text, page_words):
    """
    Scans the plain text and injects <b> tags using strict letter boundaries.
    """
    if not text:
        return ""
        
    # 1. Extract consecutive bold words into full phrases
    bold_phrases = []
    current_phrase = []
    
    for w in page_words:
        if "bold" in w.get("fontname", "").lower():
            current_phrase.append(w["text"])
        else:
            if current_phrase:
                bold_phrases.append(" ".join(current_phrase))
                current_phrase = []
    if current_phrase:
        bold_phrases.append(" ".join(current_phrase))
        
    # Clean up and sort by length (longest first)
    bold_phrases = list(set([p.strip() for p in bold_phrases if p.strip()]))
    bold_phrases.sort(key=len, reverse=True)
    
    rich_text = text
    replacements = {}
    
    for i, phrase in enumerate(bold_phrases):
        # Strict letter boundaries: allows matching even if attached to punctuation or bullet points
        pattern = rf"(?<![a-zA-Z]){re.escape(phrase)}(?![a-zA-Z])"
        
        matches = list(re.finditer(pattern, rich_text))
        if matches:
            placeholder = f"[[B_{i}]]"
            replacements[placeholder] = f"<b>{phrase}</b>"
            rich_text = re.sub(pattern, placeholder, rich_text)
            
    # Restore the placeholders with the actual HTML bold tags
    for placeholder, html_tag in replacements.items():
        rich_text = rich_text.replace(placeholder, html_tag)
        
    return rich_text

def format_bullets(text, page_words):
    """Splits a block of text into bullet objects and applies strict bolding."""
    if not text:
        return []
    
    # Split by newlines first
    raw_bullets = text.split('\n')
    
    if len(raw_bullets) == 1 and len(text) > 100:
        raw_bullets = re.split(r'(?<=[a-z\.])\s+(?=[A-Z])', text)

    bullets = []
    for pt in raw_bullets:
        clean_pt = pt.strip()
        if clean_pt:
            rich_pt = apply_bold_tags_regex(clean_pt, page_words)
            bullets.append({
                "id": str(random.random()),
                "text": rich_pt,
                "hidden": False
            })
    return bullets

def parse_pdf_to_json(pdf_path, output_path="cv-data.json"):
    print(f"Scanning {pdf_path} (High Precision Mode)...")
    
    cv_data = {
        "headerData": {
            "name": "", "line1": "", "line2": "", "banner": ""
        },
        "academics": [],
        "libraryBlocks": [],
        "cvVersions": [],
        "currentCvId": "default"
    }
    
    active_section = None
    current_block = None
    
    # CRITICAL FIX: Forces the PDF parser to detect smaller spaces (1.5px instead of 3.0px)
    # This prevents words from merging (e.g. "platformtools") and fixes bolding alignment.
    TOLERANCE = 1.5 
    table_config = {"text_x_tolerance": TOLERANCE, "text_y_tolerance": 2}

    try:
        with pdfplumber.open(pdf_path) as pdf:
            # --- 1. EXTRACT HEADER DATA ---
            first_page_text = pdf.pages[0].extract_text(x_tolerance=TOLERANCE).split('\n')
            cv_data["headerData"]["name"] = first_page_text[0].strip()
            cv_data["headerData"]["line1"] = first_page_text[1].strip()
            cv_data["headerData"]["line2"] = first_page_text[2].strip()
            cv_data["headerData"]["banner"] = first_page_text[3].strip()

            # --- 2. EXTRACT TABLES (ACADEMICS & SECTIONS) ---
            for page in pdf.pages:
                # Synchronize word extraction tolerance with table extraction tolerance
                page_words = page.extract_words(x_tolerance=TOLERANCE, extra_attrs=["fontname"])
                tables = page.extract_tables(table_settings=table_config)
                
                for table in tables:
                    for row in table:
                        r = [str(cell).strip() if cell else "" for cell in row]
                        if not r:
                            continue
                            
                        # Identify Academic Profile Rows
                        if r[0] in ["MBA", "B.Sc (Computer Science)", "Class XII", "Class X", "B.Tech", "B.E."]:
                            cv_data["academics"].append({
                                "degree": r[0],
                                "institute": r[2] if len(r) > 2 else "",
                                "score": r[3] if len(r) > 3 else "",
                                "year": r[4] if len(r) > 4 else ""
                            })
                            continue
                            
                        # Identify Section Changes
                        if r[0] == "INTERNSHIP":
                            active_section = "internship"
                            continue
                        elif r[0] == "PROJECTS":
                            active_section = "project"
                            continue
                        elif r[0] == "POSITION OF RESPONSIBILITIES":
                            active_section = "por"
                            continue
                        elif r[0] == "AWARDS AND ACHIEVEMENTS":
                            active_section = "award"
                            continue

                        # --- PARSE INTERNSHIPS & PROJECTS ---
                        if active_section in ["internship", "project"]:
                            if r[0] and "Project Title:" in r[0]:
                                if current_block:
                                    cv_data["libraryBlocks"].append(current_block)
                                
                                raw_header = r[0].replace('\n', ' ')
                                
                                title_match = re.search(r'Project Title:\s*(.*)', raw_header)
                                title = title_match.group(1).strip() if title_match else "Unknown Title"
                                pre_title = raw_header.split('Project Title:')[0].strip()
                                
                                date_match = re.search(r'(Date|\d+\s+[Ww]eeks?|Duration)$', pre_title)
                                if date_match:
                                    date_val = date_match.group(1)
                                    company = pre_title[:date_match.start()].strip()
                                else:
                                    date_val = "Duration"
                                    company = pre_title
                                
                                current_block = {
                                    "id": generate_id("int" if active_section == "internship" else "proj"),
                                    "type": active_section,
                                    "tags": ["draft"],
                                    "company": company,
                                    "date": date_val,
                                    "title": f"Project Title: {title}",
                                    "details": [],
                                    "achievements": []
                                }
                                
                            elif r[0] == "Project Details" and current_block:
                                current_block["details"] = format_bullets(r[1], page_words)
                            elif r[0] == "Achievements" and current_block:
                                current_block["achievements"] = format_bullets(r[1], page_words)

                        # --- PARSE PORs & AWARDS ---
                        elif active_section in ["por", "award"]:
                            if r[0] and r[0] not in ["POSITION OF RESPONSIBILITIES", "AWARDS AND ACHIEVEMENTS"]:
                                if current_block:
                                    cv_data["libraryBlocks"].append(current_block)
                                
                                block_type = active_section
                                
                                current_block = {
                                    "id": generate_id(block_type),
                                    "type": block_type,
                                    "tags": ["draft"],
                                    "bullets": format_bullets(r[1] if len(r) > 1 else "", page_words),
                                    "years": r[2] if len(r) > 2 else "YYYY"
                                }
                                
                                if block_type == "por":
                                    current_block["role"] = r[0].replace('\n', ' ')
                                else:
                                    current_block["category"] = r[0].replace('\n', ' ')

            if current_block:
                cv_data["libraryBlocks"].append(current_block)

        # Setup the Default CV Version
        cv_data["cvVersions"] = [{
            "id": "default",
            "name": "Master CV",
            "blocks": cv_data["libraryBlocks"].copy() 
        }]

        with open(output_path, 'w', encoding='utf-8') as f:
            json.dump(cv_data, f, indent=2)
            
        print(f"Success! Perfect JSON saved to {output_path} with accurate text spacing and bolding.")

    except Exception as e:
        print(f"Error parsing PDF: {e}")

if __name__ == "__main__":
    parse_pdf_to_json("new.pdf", "cv-data.json")
    