export interface Job {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
}

export interface Applicant {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  status: 'New' | 'Reviewing' | 'Interviewed' | 'Offered' | 'Rejected';
  appliedAt: string;
}

export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote',
    type: 'Full-time',
    description: 'We are looking for a Senior Frontend Engineer to join our core product team. You will be responsible for building and maintaining our main web application using React and TypeScript.',
    requirements: [
      '5+ years of experience with React and modern JavaScript',
      'Strong understanding of web performance and accessibility',
      'Experience with state management libraries like Redux or Zustand',
      'Excellent communication skills'
    ]
  },
  {
    id: '2',
    title: 'Product Designer',
    department: 'Design',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Join our design team to create beautiful and intuitive user experiences. You will work closely with product managers and engineers to bring ideas to life.',
    requirements: [
      '3+ years of product design experience',
      'Proficiency in Figma and prototyping tools',
      'Strong portfolio demonstrating user-centered design',
      'Experience with design systems'
    ]
  },
  {
    id: '3',
    title: 'Marketing Manager',
    department: 'Marketing',
    location: 'London, UK',
    type: 'Full-time',
    description: 'We are seeking a Marketing Manager to lead our growth initiatives. You will be responsible for planning and executing multi-channel marketing campaigns.',
    requirements: [
      '4+ years of B2B marketing experience',
      'Proven track record of successful lead generation',
      'Strong analytical skills and experience with marketing automation tools',
      'Excellent writing and editing skills'
    ]
  }
];

export const mockApplicants: Applicant[] = [
  {
    id: '101',
    jobId: '1',
    name: 'Alice Smith',
    email: 'alice@example.com',
    phone: '+1 555-0101',
    status: 'New',
    appliedAt: '2023-10-25T10:00:00Z'
  },
  {
    id: '102',
    jobId: '1',
    name: 'Bob Jones',
    email: 'bob@example.com',
    phone: '+1 555-0102',
    status: 'Reviewing',
    appliedAt: '2023-10-24T14:30:00Z'
  },
  {
    id: '103',
    jobId: '2',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    phone: '+1 555-0103',
    status: 'Interviewed',
    appliedAt: '2023-10-20T09:15:00Z'
  }
];
