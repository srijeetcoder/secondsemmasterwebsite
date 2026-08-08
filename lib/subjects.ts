import { Atom, Calculator, Code2, TestTube2, type LucideIcon } from 'lucide-react';

export type Subject = {
  id: string;
  code: string;
  title: string;
  badge: string;
  description: string;
  url: string;
  icon: LucideIcon;
  /** Accent colour as a bare "R G B" triple, fed into `--accent` for glow effects. */
  accent: string;
  /** Extra search terms so the filter matches topics, not just titles. */
  keywords: string[];
};

/**
 * The four destination notes sites.
 *
 * Every one of these must be added to your Supabase project under
 * Authentication -> URL Configuration -> Redirect URLs, otherwise Supabase
 * will refuse to hand a session over to them.
 */
export const SUBJECTS: Subject[] = [
  {
    id: 'escs-201',
    code: 'ESCS 201',
    title: 'Basic CS & Programming',
    badge: 'Core CS',
    description:
      'C programming lecture notes, code snippets, algorithms, and practice problem sets.',
    url: 'https://cnotesbycsrijeet.vercel.app/',
    icon: Code2,
    accent: '74 166 168', // muted cyan (#4AA6A8)
    keywords: [
      'c', 'programming', 'code', 'algorithms', 'loops', 'pointers', 'arrays',
      'recursion', 'data structures', 'computer science', 'compiler', 'syntax',
      'dynamic memory allocation', 'memory allocation', 'malloc', 'calloc', 'free',
      'sort', 'sorting', 'merge sort', 'bubble sort', 'selection sort', 'searching',
      'binary search', 'linear search', 'stack', 'queue', 'linked list', 'structures',
      'unions', 'functions', 'conditionals', 'operators', 'variables'
    ],
  },
  {
    id: 'bsch-201',
    code: 'BSCH 201',
    title: 'Chemistry-I',
    badge: 'Theory',
    description:
      'Molecular structure, reaction kinetics, spectroscopy, and theoretical chemistry modules.',
    url: 'https://chem-notes-nhm8.vercel.app/',
    icon: Atom,
    accent: '109 155 130', // muted sage green (#6D9B82)
    keywords: [
      'chemistry', 'molecular', 'structure', 'kinetics', 'spectroscopy',
      'thermodynamics', 'bonding', 'orbitals', 'reaction', 'theory', 'organic',
      'molecular orbital theory', 'mot', 'reaction kinetics', 'uv-vis', 'ir', 'nmr',
      'organic chemistry', 'chemical bonding', 'hybridization', 'transition metals',
      'electrochemical', 'conductance'
    ],
  },
  {
    id: 'bsch-291',
    code: 'BSCH 291',
    title: 'Chemistry Laboratory',
    badge: 'Lab Practical',
    description:
      'Practical experiment manuals, titration tables, lab observations, and viva questions.',
    url: 'https://pracchem.vercel.app/',
    icon: TestTube2,
    accent: '165 138 85', // muted amber (#A58A55)
    keywords: [
      'lab', 'practical', 'experiment', 'titration', 'observation', 'viva',
      'manual', 'apparatus', 'readings', 'burette', 'chemistry',
      'water hardness', 'hardness of water', 'edta', 'alkalinity', 'redox titration',
      'conductometric titration', 'saponification', 'viscosity', 'surface tension',
      'chloride content', 'viva questions', 'lab manual'
    ],
  },
  {
    id: 'bsm-201',
    code: 'BSM 201',
    title: 'Mathematics-II',
    badge: 'Mathematics',
    description:
      'Differential equations, linear algebra, matrix calculus, and step-by-step solved tutorials.',
    url: 'https://mathsnotesbysrijeet.vercel.app/',
    icon: Calculator,
    accent: '130 122 155', // muted violet-gray (#827A9B)
    keywords: [
      'maths', 'mathematics', 'differential', 'equations', 'linear algebra',
      'matrix', 'calculus', 'integration', 'vectors', 'eigenvalues', 'tutorials',
      'eigenvectors', 'characteristic equation', 'rank of a matrix', 'determinant',
      'vector calculus', 'line integral', 'surface integral', 'volume integral',
      'ordinary differential equations', 'ode', 'partial differential equations', 'pde',
      'laplace transform', 'fourier series'
    ],
  },
];

/** Case-insensitive filter across code, title, badge, description and keywords. */
export function filterSubjects(subjects: Subject[], query: string): Subject[] {
  const q = query.trim().toLowerCase();
  if (!q) return subjects;

  const queryWords = q.split(/\s+/).filter(w => w.length > 0);

  return subjects.filter((s) => {
    const metadata = [s.code, s.title, s.badge, s.description, ...s.keywords]
      .join(' ')
      .toLowerCase();
    
    // All search terms must match somewhere in the metadata
    return queryWords.every((word) => {
      const singularWord = word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word;
      return metadata.includes(word) || metadata.includes(singularWord);
    });
  });
}
