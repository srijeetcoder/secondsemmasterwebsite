export interface SearchItem {
  title: string;
  subjectCode: string;
  url: string;
  category: 'lecture' | 'practical' | 'solved-problem' | 'viva' | 'subject';
  snippet: string;
  keywords: string[];
}

export const SEARCH_INDEX: SearchItem[] = [
  // ==========================================
  // Basic CS & Programming (ESCS 201)
  // ==========================================
  {
    title: "C Pointers - Memory Addresses and Indirection",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/pointers",
    category: "lecture",
    snippet: "Learn pointer declarations, dereferencing, pointer arithmetic, pointer-to-pointer, and function pointers in C.",
    keywords: ["pointers", "pointer", "address-of", "dereference", "memory address", "indirection", "void pointer", "null pointer", "wild pointer"]
  },
  {
    title: "Dynamic Memory Allocation - malloc, calloc, realloc, and free",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/dynamic-memory",
    category: "lecture",
    snippet: "Master dynamic memory management in C using malloc(), calloc(), realloc(), and memory deallocation with free().",
    keywords: ["dynamic memory allocation", "malloc", "calloc", "realloc", "free", "memory leak", "dangling pointer", "heap memory", "allocation"]
  },
  {
    title: "Recursion in C - Base Case and Call Stack",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/recursion",
    category: "lecture",
    snippet: "Study recursive function structures, direct vs indirect recursion, base cases, and call stack trace examples.",
    keywords: ["recursion", "recursive", "factorial", "fibonacci", "tower of hanoi", "base case", "call stack", "stack overflow"]
  },
  {
    title: "Bubble Sort Algorithm and C Implementation",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/bubble-sort",
    category: "lecture",
    snippet: "Learn how Bubble Sort works, step-by-step swaps, optimization techniques, and C programming implementation.",
    keywords: ["bubble sort", "sorting", "sort", "ascending", "descending", "adjacent swap", "time complexity"]
  },
  {
    title: "Merge Sort Algorithm - Divide and Conquer",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/merge-sort",
    category: "lecture",
    snippet: "Detailed breakdown of the divide-and-conquer Merge Sort algorithm, recurrences, and stable sorting in C.",
    keywords: ["merge sort", "sorting", "sort", "divide and conquer", "recursive sort", "stable sort", "time complexity"]
  },
  {
    title: "Selection Sort Algorithm and Complexity",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/selection-sort",
    category: "lecture",
    snippet: "Understand Selection Sort, finding the minimum element in unsorted subarray, swaps, and time complexity.",
    keywords: ["selection sort", "sorting", "sort", "minimum element", "swaps"]
  },
  {
    title: "Binary Search - Logarithmic Search Algorithm",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/binary-search",
    category: "lecture",
    snippet: "Learn how Binary Search divides sorted arrays to locate target values in O(log n) time complexity.",
    keywords: ["binary search", "searching", "search", "sorted array", "midpoint", "logarithmic"]
  },
  {
    title: "Linear Search - Sequential Search in Arrays",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/linear-search",
    category: "lecture",
    snippet: "Simple sequential search algorithm through arrays, worst-case and best-case time complexity analyses.",
    keywords: ["linear search", "searching", "search", "sequential", "array"]
  },
  {
    title: "Structures and Unions in C",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/structures",
    category: "lecture",
    snippet: "Compare user-defined data structures and unions in C, struct members, memory padding, and nested structures.",
    keywords: ["structures", "unions", "struct", "union", "typedef", "member access", "memory alignment"]
  },
  {
    title: "Singly Linked List - Dynamic Data Structure",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/linked-list",
    category: "lecture",
    snippet: "Study singly linked list creation, node insertions, deletions, traversals, and dynamic head pointer updates.",
    keywords: ["linked list", "node", "head pointer", "dynamic list", "next pointer", "singly linked list"]
  },
  {
    title: "Stacks and Queues - Linear Data Structures",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/notes/stacks-queues",
    category: "lecture",
    snippet: "Implement LIFO stack and FIFO queue arrays, push/pop operations, enqueue/dequeue, and overflow checks.",
    keywords: ["stack", "queue", "push", "pop", "enqueue", "dequeue", "lifo", "fifo", "underflow", "overflow"]
  },

  // ==========================================
  // Chemistry-I (BSCH 201)
  // ==========================================
  {
    title: "Molecular Orbital Theory (MOT) and Energy Level Diagrams",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Molecular%20orbitals%20of%20diatomic%20molecules",
    category: "lecture",
    snippet: "Construct molecular orbital diagrams for diatomic molecules (H2, N2, O2, F2, CO, NO) and calculate bond orders.",
    keywords: ["molecular orbital theory", "mot", "bond order", "paramagnetic", "diamagnetic", "diatomic molecules", "diatomic", "orbitals", "bonding"]
  },
  {
    title: "Schrödinger Equation and Wave Mechanical Model",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Schrödinger%20equation",
    category: "lecture",
    snippet: "Introduction to wave mechanics, wavefunction interpretations, and the 1D Schrödinger wave equation derivation.",
    keywords: ["schrödinger equation", "wave equation", "wavefunction", "psi", "quantum mechanics", "wave mechanical model"]
  },
  {
    title: "Particle in a 1D Box Solution and Applications",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Particle%20in%20a%20box",
    category: "lecture",
    snippet: "Solve the Schrödinger equation for a particle trapped in a one-dimensional potential well, with energy quantization.",
    keywords: ["particle in a box", "quantum well", "energy quantization", "infinite potential well", "energy levels"]
  },
  {
    title: "Principles of Spectroscopy and Electromagnetic Radiation",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Principles%20of%20spectroscopy",
    category: "lecture",
    snippet: "Explore the electromagnetic spectrum, absorption and emission principles, and Selection Rules.",
    keywords: ["spectroscopy", "electromagnetic radiation", "selection rules", "absorption", "emission"]
  },
  {
    title: "UV-Visible Spectroscopy - Electronic Transitions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Electronic%20spectroscopy",
    category: "lecture",
    snippet: "Understand electronic excitation (pi to pi*, n to pi* transitions), conjugation effects, and Beer-Lambert's law.",
    keywords: ["uv-visible spectroscopy", "electronic spectroscopy", "beer-lambert law", "chromophore", "conjugation", "uv", "visible"]
  },
  {
    title: "Infrared (IR) Spectroscopy - Bond Vibrations",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Vibrational%20spectroscopy",
    category: "lecture",
    snippet: "Study molecular vibrations, stretching and bending modes, Hooke's law, and IR functional group identification.",
    keywords: ["ir spectroscopy", "infrared", "vibrational spectroscopy", "stretching", "bending", "functional group", "ir"]
  },
  {
    title: "Proton NMR Spectroscopy - Chemical Shifts",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Nuclear%20Magnetic%20Resonance%20spectroscopy",
    category: "lecture",
    snippet: "Analyze nuclear spins, shielding effects, chemical shifts (ppm), spin-spin coupling, and proton NMR spectra interpretation.",
    keywords: ["nmr spectroscopy", "nmr", "nuclear magnetic resonance", "chemical shift", "spin-spin coupling", "shielding"]
  },
  {
    title: "Aromaticity, Anti-aromaticity, and Huckel's Rule",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Aromaticity%20and%20Huckel's%20rule",
    category: "lecture",
    snippet: "Determine aromaticity of cyclic conjugated systems using Huckel's (4n+2) pi-electron rule.",
    keywords: ["aromaticity", "huckel rule", "huckel", "anti-aromatic", "benzene", "conjugated ring", "organic"]
  },
  {
    title: "Stereochemistry - configurations and conformations",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Conformational%20analysis%20of%20cyclohexane",
    category: "lecture",
    snippet: "Study 3D molecular representations (Fischer, Newman), chirality, R/S configurations, and chair/boat conformations of cyclohexane.",
    keywords: ["stereochemistry", "cyclohexane", "chair conformation", "boat conformation", "chiral", "enantiomers", "diastereomers", "r/s configuration"]
  },

  // ==========================================
  // Chemistry Laboratory (BSCH 291)
  // ==========================================
  {
    title: "EDTA Titration - Determination of Water Hardness",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/experiment/hardness",
    category: "practical",
    snippet: "Readings table, chemical reactions, and EDTA calculation formula for temporary and permanent water hardness.",
    keywords: ["hardness", "water hardness", "edta titration", "edta", "ebt indicator", "ebt", "complexometric titration", "calcium", "magnesium"]
  },
  {
    title: "Alkalinity Estimation using Methyl Orange and Phenolphthalein",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/experiment/alkalinity",
    category: "practical",
    snippet: "Titration of water samples with standard acid to determine hydroxide, carbonate, and bicarbonate alkalinities.",
    keywords: ["alkalinity", "carbonate", "bicarbonate", "hydroxide alkalinity", "phenolphthalein", "methyl orange"]
  },
  {
    title: "Viscosity Measurement using Ostwald Viscometer",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/experiment/viscosity",
    category: "practical",
    snippet: "Viscosity coefficient calculations of liquid samples by measuring flow times through an Ostwald Viscometer.",
    keywords: ["viscosity", "ostwald viscometer", "viscometer", "flow time", "coefficient of viscosity"]
  },
  {
    title: "Surface Tension Measurement using Stalagmometer",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/experiment/surface-tension",
    category: "practical",
    snippet: "Determine the surface tension of unknown liquids relative to water using the drop-number Stalagmometer method.",
    keywords: ["surface tension", "stalagmometer", "drop number", "liquids"]
  },
  {
    title: "Practical Chemistry Lab Viva Sheets and Answers",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/viva",
    category: "viva",
    snippet: "Prepare with commonly asked lab examiner questions on indicator color changes, EDTA buffers, and errors.",
    keywords: ["viva", "viva questions", "lab questions", "examiner questions", "practical viva"]
  },

  // ==========================================
  // Mathematics-II (BSM 201)
  // ==========================================
  {
    title: "Eigenvalues and Eigenvectors Solved Tutorial Sheets",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/eigenvalues-eigenvectors",
    category: "solved-problem",
    snippet: "Learn characteristic polynomial equations, eigenvalues computation, and eigenvector basis verification.",
    keywords: ["eigenvalue", "eigenvector", "eigenvalues", "eigenvectors", "characteristic polynomial", "det(a - lambda i)", "diagonalization"]
  },
  {
    title: "Rank of a Matrix - Row Echelon Form Solver",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/rank-matrix",
    category: "solved-problem",
    snippet: "Find matrix rank using elementary row transformations to convert matrices to Row Echelon Form.",
    keywords: ["rank of a matrix", "rank", "echelon form", "row reduction", "elementary transformation", "matrix rank"]
  },
  {
    title: "Vector Calculus - Line, Surface, and Volume Integrals",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/vector-integration",
    category: "solved-problem",
    snippet: "Understand Green's Theorem, Gauss Divergence Theorem, and Stokes' Theorem for vector fields.",
    keywords: ["vector calculus", "green theorem", "stokes theorem", "divergence theorem", "gauss divergence", "line integral", "surface integral"]
  },
  {
    title: "First-Order and Higher-Order ODE Tutorials",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/ode",
    category: "solved-problem",
    snippet: "Solve differential equations using integrating factors, complementary functions (CF), and particular integrals (PI).",
    keywords: ["differential equations", "ode", "integrating factor", "complementary function", "particular integral", "order", "degree"]
  },
  {
    title: "Laplace Transform and Inverse Laplace Solutions",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/laplace-transform",
    category: "solved-problem",
    snippet: "Step-by-step laplace transformations of standard functions, shifting theorems, and solving differential equations.",
    keywords: ["laplace transform", "laplace", "inverse laplace", "shifting theorem", "convolution theorem"]
  }
];
