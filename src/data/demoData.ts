// Demo data with clearly fake IDs for training sessions
export const demoMentors = [
  {
    id: "DEMO_MENTOR_001",
    staffId: "DEMO_STAFF_001", 
    name: "Dr. Sarah Johnson",
    email: "demo.sarah@training.edu",
    department: "Computer Science",
    programs: ["Engineering", "Computer Science"],
    status: "active",
    expertise: ["Machine Learning", "Software Engineering", "Research Methods"],
    activeAssignments: 3,
    totalSessions: 42,
    avatar: `https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_MENTOR_002", 
    staffId: "DEMO_STAFF_002",
    name: "Prof. Michael Chen",
    email: "demo.michael@training.edu", 
    department: "Mathematics",
    programs: ["Mathematics", "Statistics"],
    status: "active",
    expertise: ["Data Science", "Statistics", "Mathematical Modeling"],
    activeAssignments: 2,
    totalSessions: 28,
    avatar: `https://images.unsplash.com/photo-1535268647677-300dbf3078d1?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_MENTOR_003",
    staffId: "DEMO_STAFF_003", 
    name: "Dr. Emily Rodriguez",
    email: "demo.emily@training.edu",
    department: "Psychology",
    programs: ["Psychology", "Counseling"],
    status: "active",
    expertise: ["Cognitive Psychology", "Student Counseling", "Research Design"],
    activeAssignments: 4,
    totalSessions: 51,
    avatar: `https://images.unsplash.com/photo-1472396961693-142e6e269027?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_MENTOR_004",
    staffId: "DEMO_STAFF_004",
    name: "Dr. James Wilson", 
    email: "demo.james@training.edu",
    department: "Business",
    programs: ["Business Administration", "Marketing"],
    status: "active",
    expertise: ["Entrepreneurship", "Business Strategy", "Leadership"],
    activeAssignments: 1,
    totalSessions: 15,
    avatar: `https://images.unsplash.com/photo-1517022812141-23620dba5c23?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_MENTOR_005",
    staffId: "DEMO_STAFF_005",
    name: "Prof. Lisa Anderson",
    email: "demo.lisa@training.edu",
    department: "Engineering", 
    programs: ["Mechanical Engineering", "Robotics"],
    status: "inactive",
    expertise: ["Robotics", "Automation", "Product Design"],
    activeAssignments: 0,
    totalSessions: 8,
    avatar: `https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop&crop=face`
  }
];

export const demoStudents = [
  {
    id: "DEMO_STUDENT_001",
    studentId: "DEMO_STU_001",
    rollNo: "DEMO2024001",
    name: "Alex Chen",
    email: "demo.alex@training.edu",
    program: "Computer Science",
    semesterYear: 6,
    status: "active",
    gpa: 3.8,
    interests: ["Machine Learning", "Web Development", "Mobile Apps"],
    mentor: "Dr. Sarah Johnson",
    avatar: `https://images.unsplash.com/photo-1441057206919-63d19fac2369?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_STUDENT_002", 
    studentId: "DEMO_STU_002",
    rollNo: "DEMO2024002",
    name: "Maria Rodriguez",
    email: "demo.maria@training.edu",
    program: "Mathematics",
    semesterYear: 4,
    status: "active", 
    gpa: 3.9,
    interests: ["Statistics", "Data Analysis", "Research"],
    mentor: "Prof. Michael Chen",
    avatar: `https://images.unsplash.com/photo-1501286353178-1ec881214838?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_STUDENT_003",
    studentId: "DEMO_STU_003", 
    rollNo: "DEMO2024003",
    name: "David Kim",
    email: "demo.david@training.edu",
    program: "Psychology",
    semesterYear: 2,
    status: "active",
    gpa: 3.6,
    interests: ["Cognitive Science", "Mental Health", "Counseling"],
    mentor: "Dr. Emily Rodriguez",
    avatar: `https://images.unsplash.com/photo-1469041797191-50ace28483c3?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_STUDENT_004",
    studentId: "DEMO_STU_004",
    rollNo: "DEMO2024004", 
    name: "Sarah Thompson",
    email: "demo.sarah.t@training.edu",
    program: "Business Administration",
    semesterYear: 8,
    status: "active",
    gpa: 3.7,
    interests: ["Entrepreneurship", "Marketing", "Leadership"],
    mentor: "Dr. James Wilson",
    avatar: `https://images.unsplash.com/photo-1452378174528-3090a4bba7b2?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_STUDENT_005",
    studentId: "DEMO_STU_005",
    rollNo: "DEMO2024005",
    name: "Jordan Lee",
    email: "demo.jordan@training.edu", 
    program: "Mechanical Engineering",
    semesterYear: 5,
    status: "active",
    gpa: 3.5,
    interests: ["Robotics", "3D Printing", "Automation"],
    mentor: null,
    avatar: `https://images.unsplash.com/photo-1487252665478-49b61b47f302?w=400&h=400&fit=crop&crop=face`
  },
  {
    id: "DEMO_STUDENT_006",
    studentId: "DEMO_STU_006",
    rollNo: "DEMO2024006",
    name: "Emma Davis",
    email: "demo.emma@training.edu",
    program: "Computer Science",
    semesterYear: 3,
    status: "inactive",
    gpa: 3.4,
    interests: ["Web Design", "UI/UX", "Frontend Development"],
    mentor: "Dr. Sarah Johnson",
    avatar: `https://images.unsplash.com/photo-1535268647677-300dbf3078d1?w=400&h=400&fit=crop&crop=face`
  }
];

export const demoAssignments = [
  {
    id: "DEMO_ASSIGN_001",
    mentorId: "DEMO_MENTOR_001",
    mentorName: "Dr. Sarah Johnson", 
    menteeId: "DEMO_STUDENT_001",
    menteeName: "Alex Chen",
    startDate: "2024-01-15",
    endDate: "2024-12-15",
    status: "Active",
    sessionsCount: 12,
    lastSession: "2024-01-02",
    nextSession: "2024-01-08", 
    goals: 3,
    completedGoals: 1
  },
  {
    id: "DEMO_ASSIGN_002",
    mentorId: "DEMO_MENTOR_002",
    mentorName: "Prof. Michael Chen",
    menteeId: "DEMO_STUDENT_002", 
    menteeName: "Maria Rodriguez",
    startDate: "2024-01-10",
    endDate: "2024-12-10",
    status: "Active",
    sessionsCount: 8,
    lastSession: "2023-12-28",
    nextSession: "2024-01-05",
    goals: 2,
    completedGoals: 2
  },
  {
    id: "DEMO_ASSIGN_003",
    mentorId: "DEMO_MENTOR_003",
    mentorName: "Dr. Emily Rodriguez",
    menteeId: "DEMO_STUDENT_003",
    menteeName: "David Kim", 
    startDate: "2024-01-08",
    endDate: "2024-12-08",
    status: "Pending",
    sessionsCount: 0,
    lastSession: null,
    nextSession: "2024-01-12",
    goals: 0,
    completedGoals: 0
  }
];

export const demoSessions = [
  {
    id: "DEMO_SESSION_001",
    name: "Initial Mentoring Session - Goal Setting",
    date: "2024-01-08",
    time: "14:00",
    location: "Room 201A",
    type: "one_on_one",
    status: "completed",
    mentor: "Dr. Sarah Johnson",
    students: ["Alex Chen"],
    description: "First meeting to establish mentoring relationship and set initial goals"
  },
  {
    id: "DEMO_SESSION_002", 
    name: "Progress Review - Machine Learning Project",
    date: "2024-01-15",
    time: "10:30",
    location: "Virtual Meeting",
    type: "one_on_one",
    status: "completed", 
    mentor: "Dr. Sarah Johnson",
    students: ["Alex Chen"],
    description: "Review progress on machine learning coursework and research project"
  },
  {
    id: "DEMO_SESSION_003",
    name: "Career Planning Discussion",
    date: "2024-01-20",
    time: "15:00",
    location: "Office 305",
    type: "one_on_one",
    status: "pending",
    mentor: "Dr. Emily Rodriguez",
    students: ["David Kim"],
    description: "Discuss career paths in psychology and graduate school preparation"
  }
];

export const demoGoals = [
  {
    id: "DEMO_GOAL_001",
    studentId: "DEMO_STUDENT_001",
    studentName: "Alex Chen",
    areaOfFocus: "Technical Skills Development",
    smartGoal: "Complete advanced machine learning course with grade A by end of semester",
    knowledgeWhat: "Deep learning algorithms, neural networks, model optimization",
    knowledgeHow: "Through coursework, online tutorials, and hands-on projects",
    skillsWhat: "Python programming, TensorFlow, data preprocessing",
    skillsHow: "Practice coding daily, work on real datasets, contribute to open source",
    actionPlan: "1. Complete weekly assignments 2. Build personal ML project 3. Attend ML seminars",
    targetDate: "2024-05-15",
    status: "in_progress",
    progress: 60
  },
  {
    id: "DEMO_GOAL_002",
    studentId: "DEMO_STUDENT_002", 
    studentName: "Maria Rodriguez",
    areaOfFocus: "Research Skills",
    smartGoal: "Complete independent research project on statistical modeling by March 2024",
    knowledgeWhat: "Advanced statistical methods, research methodology, data analysis",
    knowledgeHow: "Literature review, mentor guidance, statistics workshops",
    skillsWhat: "R programming, statistical software, academic writing",
    skillsHow: "Daily practice with R, writing workshops, peer review sessions",
    actionPlan: "1. Literature review completion 2. Data collection 3. Analysis and write-up",
    targetDate: "2024-03-30",
    status: "completed",
    progress: 100
  }
];

export const getDemoMentors = () => demoMentors;
export const getDemoStudents = () => demoStudents;
export const getDemoAssignments = () => demoAssignments;
export const getDemoSessions = () => demoSessions;
export const getDemoGoals = () => demoGoals;