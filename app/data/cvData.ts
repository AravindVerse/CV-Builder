export interface SubSection {
  label: string; // e.g., "Project Details" or "Achievements"
  bullets: string[];
}

export interface InternshipOrProject {
  companyOrCollege: string;
  duration: string;
  projectTitle: string;
  details: SubSection[];
}

export const cvData = {
  header: {
    name: "Aravind Tupakula",
    details: "Male, 21 years\nMBA, Batch 25 - 27",
    banner: "Sustainability | Power BI | 3D Artist | Botanophile"
  },
  internship: [
    {
      companyOrCollege: "Dream India Technologies",
      duration: "Jan'24-Apr'24",
      projectTitle: "Project Title: Student Performance Analytics and Management System",
      details: [
        {
          label: "Project Details",
          bullets: [
            "Collaborated with faculty teams to gather requirements and align with academic workflows for smoother adoption",
            "Built a scalable student management system using OOP, automating academic records for 200+ students efficiently",
            "Designed a user-focused interface for faculty to improve adoption & engagement across the academic departments",
            "Engineered Python analytics tool with GUI & Seaborn, enabling real-time academic performance visuals and insights",
            "Streamlined data parsing & serialization, reduced latency, enhanced efficiency and optimized analytics workflows"
          ]
        },
        {
          label: "Achievements",
          bullets: [
            "Computerized student attendance tracking, saving 10+ hours per month and reducing faculty workload significantly",
            "Improved reporting efficiency by reducing generation time by 50%, enabling quicker delivery of detailed performance",
            "Built a resilient file I/O pipeline, increasing data throughput by 40% across 5+ modules through efficient data handling"
          ]
        }
      ]
    }
  ]
};