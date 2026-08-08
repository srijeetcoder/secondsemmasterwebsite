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
    title: "Introduction to C & Program Structure",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=0&section=0",
    category: "lecture",
    snippet: "Learn the fundamentals of C, preprocessor directives, main function block, and program execution flow.",
    keywords: ["history of c", "dennis ritchie", "bell labs", "unix", "structure of c", "preprocessor directives", "main function", "variable declarations", "statements", "return 0", "printf", "scanf", "header files"]
  },
  {
    title: "Variables, Constants, and Data Types in C",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=0&section=1",
    category: "lecture",
    snippet: "Master data types (int, char, float, double) and rules for variable declarations and ASCII values.",
    keywords: ["variables", "constants", "data types", "integer", "char", "float", "double", "short", "long", "signed", "unsigned", "ascii", "variable naming rules", "camelcase", "snake_case", "reserved keywords", "bytes"]
  },
  {
    title: "Variable Input and Output (printf / scanf)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=0&section=2",
    category: "lecture",
    snippet: "Learn standard input-output operations, format specifiers, and using the address-of ampersand operator.",
    keywords: ["input", "output", "printf", "scanf", "format specifiers", "%d", "%c", "%f", "%lf", "%s", "ampersand", "address-of", "buffer", "whitespace"]
  },
  {
    title: "Classification of C Operators",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=1&section=0",
    category: "lecture",
    snippet: "Explore all operator classes: Arithmetic, Relational, Logical, Assignment, Bitwise, and Increment/Decrement.",
    keywords: ["operators", "arithmetic operators", "relational operators", "logical operators", "bitwise operators", "assignment operators", "increment operator", "decrement operator", "prefix", "postfix", "modulus", "and", "or", "not", "xor", "left shift", "right shift"]
  },
  {
    title: "Operator Precedence and Associativity",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=1&section=1",
    category: "lecture",
    snippet: "Understand calculation precedence, associativity, and short-circuit evaluation in complex expressions.",
    keywords: ["precedence", "associativity", "operator precedence", "bodmas", "short-circuiting", "evaluation order", "increment decrement precedence"]
  },
  {
    title: "Conditional Statements (if-else, switch-case)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=2&section=0",
    category: "lecture",
    snippet: "Implement logic branch structures with if, else-if, nested-if, switch-case fall-throughs, and ternary operators.",
    keywords: ["conditionals", "if", "else if", "switch-case", "switch", "break", "fall-through", "default", "nested if", "ternary operator"]
  },
  {
    title: "Loop Iterations (for, while, do-while)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=2&section=1",
    category: "lecture",
    snippet: "Control repetitive loops with entry-controlled and exit-controlled iterations, breaks, and continues.",
    keywords: ["loops", "for loop", "while loop", "do-while loop", "entry-controlled", "exit-controlled", "break", "continue", "infinite loop", "nested loops"]
  },
  {
    title: "Anatomy of a C Function",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=3&section=0",
    category: "lecture",
    snippet: "Deconstruct modular C programs using function declarations (prototypes), definitions, and calls.",
    keywords: ["functions", "function declaration", "function definition", "function call", "prototype", "parameters", "arguments", "formal arguments", "actual arguments", "return type", "void"]
  },
  {
    title: "Argument Passing: Call by Value vs Reference",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=3&section=1",
    category: "lecture",
    snippet: "Examine parameter passing styles, copy creations, and referencing original memory blocks via pointers.",
    keywords: ["call by value", "call by reference", "argument passing", "pointers call by reference", "photocopy analogy", "swap function"]
  },
  {
    title: "Recursion in C - Base Case and Call Stack",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=3&section=2",
    category: "lecture",
    snippet: "Study recursive function architectures, direct vs indirect recursion, base cases, and call stack traces.",
    keywords: ["recursion", "recursive", "factorial", "fibonacci", "tower of hanoi", "base case", "call stack", "stack overflow"]
  },
  {
    title: "Introduction to Arrays",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=4&section=0",
    category: "lecture",
    snippet: "Learn contiguous memory layouts, offsets, index properties, and 1D and 2D matrix allocations.",
    keywords: ["arrays", "array", "contiguous memory", "index", "offset", "subscript", "1d array", "2d array", "matrix", "index[arr]"]
  },
  {
    title: "Strings & Input/Output Scan Patterns",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=4&section=1",
    category: "lecture",
    snippet: "Implement string arrays terminated by null characters, scansets, and safe buffer reading with fgets.",
    keywords: ["strings", "string", "null terminator", "viva", "\\0", "char array", "scanset", "%[^\\n]", "fgets", "scanf string", "buffer overflow"]
  },
  {
    title: "String Library Functions (string.h)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=4&section=2",
    category: "lecture",
    snippet: "Analyze string lengths, copies, concatenations, and lexicographical comparisons using string.h utilities.",
    keywords: ["string.h", "strlen", "strcpy", "strcat", "strcmp", "string functions", "lexicographical comparison"]
  },
  {
    title: "Pointers Concept, Syntax, and Pointer Arithmetic",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=5&section=0",
    category: "lecture",
    snippet: "Demystify pointer declarations, address-of and dereference operators, void pointers, and arithmetic increments.",
    keywords: ["pointers", "pointer", "address-of", "&", "dereference", "*", "void pointer", "null pointer", "dangling pointer", "wild pointer", "pointer arithmetic"]
  },
  {
    title: "Dynamic Memory Allocation (malloc, calloc, realloc, and free)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=5&section=1",
    category: "lecture",
    snippet: "Master runtime memory management on the heap, block initializations, resizing, and freeing memory leaks.",
    keywords: ["dynamic memory allocation", "dma", "malloc", "calloc", "realloc", "free", "heap", "memory leak", "dangling pointer", "stdlib.h"]
  },
  {
    title: "Structures & Member Access in C",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=6&section=0",
    category: "lecture",
    snippet: "Group heterogeneous variables together using struct and access members via dot and arrow operators.",
    keywords: ["structures", "struct", "member access", "dot operator", "arrow operator", "->", "passport analogy", "nested structures"]
  },
  {
    title: "Unions, Enums, and Typedef Custom Aliases",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=6&section=1",
    category: "lecture",
    snippet: "Construct memory-efficient unions sharing locations, enums with integer constants, and typedef type aliasing.",
    keywords: ["unions", "union", "enum", "enumeration", "typedef", "alias", "shared memory"]
  },
  {
    title: "File Pointers & Read/Write Operations",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=7&section=0",
    category: "lecture",
    snippet: "Store program data permanently using file pointers, fopen, fclose, text/binary streams, and formatted printfs.",
    keywords: ["file handling", "file", "FILE pointer", "fopen", "fclose", "fgetc", "fputc", "fgets", "fputs", "fprintf", "fscanf", "read mode", "write mode", "append mode"]
  },
  {
    title: "File Traversal & Cursor Control (fseek, ftell, rewind)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=7&section=1",
    category: "lecture",
    snippet: "Coordinate the file indicator position using seek calculations (SEEK_SET, SEEK_CUR, SEEK_END), ftell offsets, and rewind.",
    keywords: ["fseek", "ftell", "rewind", "cursor control", "file position indicator", "SEEK_SET", "SEEK_CUR", "SEEK_END"]
  },
  {
    title: "Storage Classes (auto, register, static, extern)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=8&section=0",
    category: "lecture",
    snippet: "Examine variable storage properties, local/global visibility scope, lifetimes, static counters, and external linkages.",
    keywords: ["storage classes", "auto", "register", "static", "extern", "scope", "lifetime", "static counter"]
  },
  {
    title: "Preprocessors & Command Line Arguments (argc / argv)",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=study&chapter=8&section=1",
    category: "lecture",
    snippet: "Track compile-time preprocessors, macro expansions, conditional definitions, and command terminal inputs.",
    keywords: ["preprocessors", "define", "macro", "include", "argc", "argv", "command line arguments"]
  },
  {
    title: "Sorting & Searching Algorithms Interactive Visualizers",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=visualizers&tab=sort_algos",
    category: "solved-problem",
    snippet: "Simulate and visualize adjacent swaps, divide-and-conquers, minima swaps, and O(log n) searches.",
    keywords: ["bubble sort", "merge sort", "selection sort", "insertion sort", "binary search", "linear search", "sorting visualizer", "algorithms"]
  },
  {
    title: "Linear Data Structures Interactive Simulators",
    subjectCode: "ESCS 201",
    url: "https://cnotesbycsrijeet.vercel.app/?page=visualizers&tab=ds",
    category: "solved-problem",
    snippet: "Visualize node pointers, insertions/deletions in singly linked lists, LIFO stack push/pops, and FIFO queues.",
    keywords: ["singly linked list", "linked list", "stack", "queue", "push", "pop", "enqueue", "dequeue", "ds visualizer", "data structures"]
  },

  // ==========================================
  // Chemistry-I (BSCH 201)
  // ==========================================
  {
    title: "Schrödinger Equation & Wave Mechanical Model",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Schr%C3%B6dinger%20equation%3A%20introduction%20and%20wave%20mechanical%20model",
    category: "lecture",
    snippet: "Introduction to wave mechanics, wavefunction interpretations (psi), and the 1D Schrödinger wave equation derivation.",
    keywords: ["schrödinger equation", "schrödinger", "wave mechanical model", "wavefunction", "psi", "quantum mechanics", "wave equation", "schrodinger"]
  },
  {
    title: "Particle in a Box Solutions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Particle%20in%20a%20box%3A%20solutions%20and%20applications%20for%20simple%20systems",
    category: "lecture",
    snippet: "Solve the Schrödinger equation for a particle trapped in an infinite potential well, showing energy quantization.",
    keywords: ["particle in a box", "infinite potential well", "energy quantization", "quantum mechanics", "particle in a box solution", "wavefunction"]
  },
  {
    title: "Molecular Orbitals of Diatomic Molecules",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Molecular%20orbitals%20of%20diatomic%20molecules%20(H%E2%82%82%2C%20N%E2%82%82%2C%20O%E2%82%82%2C%20F%E2%82%82%2C%20CO%2C%20NO)",
    category: "lecture",
    snippet: "Construct molecular orbital diagrams for homonuclear and heteronuclear molecules (H2, N2, O2, F2, CO, NO) and calculate bond orders.",
    keywords: ["molecular orbital theory", "mot", "diatomic molecules", "h2", "n2", "o2", "f2", "co", "no", "bond order", "paramagnetic", "diamagnetic"]
  },
  {
    title: "Energy Level Diagrams of Diatomic Molecules",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Energy%20level%20diagrams%20of%20diatomic%20molecules",
    category: "lecture",
    snippet: "Learn configuration rules for homonuclear and heteronuclear diatomic systems, shell orderings, and bond properties.",
    keywords: ["molecular orbital diagrams", "energy level diagrams", "bond order", "homonuclear", "heteronuclear"]
  },
  {
    title: "Pi-Molecular Orbitals of Butadiene and Benzene",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=pi-molecular%20orbitals%20of%20butadiene%20and%20benzene",
    category: "lecture",
    snippet: "Examine pi-orbital systems in conjugated chain and ring molecules like 1,3-butadiene and benzene.",
    keywords: ["butadiene", "benzene", "pi molecular orbitals", "conjugated systems", "delocalization", "huckel"]
  },
  {
    title: "Aromaticity and Huckel's Rule",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Aromaticity%20and%20Huckel's%20rule",
    category: "lecture",
    snippet: "Evaluate ring structures for aromatic, antiaromatic, or nonaromatic classifications using the (4n+2) pi-electron rule.",
    keywords: ["aromaticity", "huckel's rule", "4n+2", "antiaromatic", "nonaromatic", "resonance energy", "huckel"]
  },
  {
    title: "Crystal Field Theory (CFT) and d-orbital Splitting",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Crystal%20Field%20Theory%20(CFT)%20and%20splitting%20in%20octahedral%2Ftetrahedral%20geometries",
    category: "lecture",
    snippet: "Study electrostatic field splitting of metal d-orbitals under octahedral and tetrahedral ligand coordinations.",
    keywords: ["crystal field theory", "cft", "crystal field splitting", "octahedral", "tetrahedral", "d-orbital splitting", "high spin", "low spin", "cfse"]
  },
  {
    title: "Energy Level Diagrams of Transition Metal Ions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Energy%20level%20diagrams%20of%20transition%20metal%20ions",
    category: "lecture",
    snippet: "Trace d-orbital distributions in transition metal ions based on strong and weak field spectrochemical ligands.",
    keywords: ["transition metal ions", "d-orbital energy levels", "spectrochemical series"]
  },
  {
    title: "Magnetic Properties of Transition Metal Complexes",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Magnetic%20properties%20of%20transition%20metal%20complexes",
    category: "lecture",
    snippet: "Calculate spin-only magnetic moments in Bohr Magnetons (BM) to evaluate paramagnetism and diamagnetism.",
    keywords: ["magnetic properties", "paramagnetism", "diamagnetism", "spin-only formula", "magnetic moment", "bohr magneton"]
  },
  {
    title: "Band Structure of Solids and Semiconductor Doping",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Band%20structure%20of%20solids%20and%20the%20role%20of%20doping%20on%20band%20structures",
    category: "lecture",
    snippet: "Trace valence and conduction bands in solids, and the effects of interstitial n-type or p-type dopings.",
    keywords: ["band theory", "conduction band", "valence band", "band gap", "semiconductors", "doping", "n-type", "p-type"]
  },
  {
    title: "Principles of Spectroscopy and Electromagnetic Radiation",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Principles%20of%20spectroscopy%20and%20electromagnetic%20radiation",
    category: "lecture",
    snippet: "Examine EMR wave parameters, electromagnetic spectrum intervals, and energy absorption/emission transitions.",
    keywords: ["spectroscopy", "electromagnetic radiation", "emr", "electromagnetic spectrum", "absorption", "emission"]
  },
  {
    title: "Selection Rules in Spectroscopy",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Selection%20rules%20in%20spectroscopy",
    category: "lecture",
    snippet: "Differentiate allowed transitions from forbidden transitions using spin and Laporte quantum rules.",
    keywords: ["selection rules", "allowed transitions", "forbidden transitions", "spin selection rule", "laporte selection rule"]
  },
  {
    title: "Electronic Spectroscopy: UV-Visible Transitions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Electronic%20spectroscopy%3A%20UV-Visible%20transitions%20and%20applications",
    category: "lecture",
    snippet: "Analyze electronic transitions (pi to pi*, n to pi*), conjugation red shifts, and Beer-Lambert calculations.",
    keywords: ["uv-visible", "electronic transitions", "beer-lambert law", "chromophore", "auxochrome", "bathochromic shift", "hypsochromic shift"]
  },
  {
    title: "Fluorescence Principles & Medical Applications",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Fluorescence%3A%20principle%20and%20applications%20in%20medicine",
    category: "lecture",
    snippet: "Examine radiative relaxations, singlet-triplet spin states, Jablonski diagrams, and fluorophores in medicine.",
    keywords: ["fluorescence", "phosphorescence", "singlet state", "triplet state", "jablonski diagram", "fluorophores", "medical diagnostics"]
  },
  {
    title: "Vibrational (IR) Spectroscopy - Functional Groups",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Vibrational%20(IR)%20spectroscopy%3A%20diatomic%20molecules%20and%20functional%20group%20analysis",
    category: "lecture",
    snippet: "Analyze stretching and bending vibrations, functional group frequencies, Hooke's Law calculations, and IR bands.",
    keywords: ["ir spectroscopy", "infrared", "hooke's law", "molecular vibrations", "stretching", "bending", "functional groups", "fingerprint region"]
  },
  {
    title: "Rotational Spectroscopy - Rigid Rotor Model",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Rotational%20spectroscopy%3A%20rigid%20rotor%20model%20of%20diatomic%20molecules",
    category: "lecture",
    snippet: "Learn microwave rotational transitions in rigid diatomic rotors and moment of inertia properties.",
    keywords: ["rotational spectroscopy", "microwave spectroscopy", "rigid rotor", "moment of inertia", "diatomic molecules"]
  },
  {
    title: "Nuclear Magnetic Resonance (NMR) Spectroscopy",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Nuclear%20Magnetic%20Resonance%20(NMR)%20spectroscopy%3A%20basic%20principles%20and%20applications",
    category: "lecture",
    snippet: "Examine nuclear spin states, shielding constants, chemical shift values (ppm), TMS references, and spin couplings.",
    keywords: ["nmr", "proton nmr", "chemical shift", "shielding", "deshielding", "spin-spin splitting", "tms standard", "coupling constant"]
  },
  {
    title: "Magnetic Resonance Imaging (MRI) Principles",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Magnetic%20Resonance%20Imaging%20(MRI)%3A%20principle%20and%20diagnostic%20applications",
    category: "lecture",
    snippet: "Learn the application of proton spin relaxations in clinical diagnostics and image contrast settings.",
    keywords: ["mri", "magnetic resonance imaging", "diagnostic imaging", "spin relaxation"]
  },
  {
    title: "Surface Characterization (SEM, TEM, and AFM)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Surface%20characterization%20techniques",
    category: "lecture",
    snippet: "Explore high-resolution surface microscopies using Scanning Electron, Transmission Electron, and Atomic Force microscopes.",
    keywords: ["surface characterization", "sem", "tem", "afm", "electron microscopy"]
  },
  {
    title: "Diffraction and Scattering Methods",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Diffraction%20and%20scattering%20methods",
    category: "lecture",
    snippet: "Study crystal lattices, X-ray diffraction peaks, Bragg's Law equations, and scattering profiles.",
    keywords: ["xrd", "x-ray diffraction", "bragg's law", "scattering"]
  },
  {
    title: "Intermolecular Forces and Interactions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Ionic%2C%20dipolar%20and%20van%20der%20Waals%20interactions",
    category: "lecture",
    snippet: "Differentiate non-covalent forces: ion-dipole, dipole-dipole, London dispersion, and Van der Waals interactions.",
    keywords: ["intermolecular forces", "ionic interactions", "dipole-dipole", "van der waals", "london dispersion", "hydrogen bonding"]
  },
  {
    title: "Real Gases - van der Waals Equation and Critical States",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Equations%20of%20state%20of%20real%20gases%20and%20critical%20phenomena",
    category: "lecture",
    snippet: "Correct ideal gas deviations using van der Waals pressure and volume factors, and calculate critical temperature constants.",
    keywords: ["van der waals equation", "real gases", "compressibility factor", "critical temperature", "critical pressure", "critical volume"]
  },
  {
    title: "Potential Energy Surfaces (PES)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Potential%20energy%20surfaces%3A%20introduction%20and%20representations",
    category: "lecture",
    snippet: "Map chemical reaction coordinate trajectories, transition states, and activation barriers on potential surfaces.",
    keywords: ["potential energy surface", "pes", "transition state", "activation energy", "reaction coordinate"]
  },
  {
    title: "Thermodynamic Functions: Enthalpy, Entropy, and Gibbs Free Energy",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Thermodynamic%20functions%3A%20energy%2C%20entropy%20and%20free%20energy",
    category: "lecture",
    snippet: "Formulate state changes in internal energy, enthalpy, entropy, and Gibbs free energy to predict reaction spontaneity.",
    keywords: ["thermodynamics", "internal energy", "enthalpy", "entropy", "gibbs free energy", "spontaneity", "gibbs-helmholtz"]
  },
  {
    title: "First and Second Laws of Thermodynamics",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=First%20and%20Second%20laws%20of%20thermodynamics%3A%20brief%20overview",
    category: "lecture",
    snippet: "Review energy conservation constraints (first law) and the continuous increase in universal entropy (second law).",
    keywords: ["first law of thermodynamics", "second law of thermodynamics", "conservation of energy", "entropy increase", "clausius statement"]
  },
  {
    title: "Estimations of Entropy and Free Energies",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Estimations%20of%20entropy%20and%20free%20frenergies",
    category: "lecture",
    snippet: "Solve entropy calculations and free energy increments under standard and non-standard reaction states.",
    keywords: ["entropy estimation", "free energy estimation", "statistical thermodynamics"]
  },
  {
    title: "Relationship between Free Energy and EMF",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Relationship%20between%20free%20energy%20and%20EMF",
    category: "lecture",
    snippet: "Connect thermodynamic free energy changes directly to electrochemical cell EMF values via delta G = -nFE.",
    keywords: ["electrochemistry", "emf", "free energy and emf", "delta g equals -nfe"]
  },
  {
    title: "Cell Potentials & Nernst Equation Applications",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Cell%20potentials%2C%20Nernst%20equation%20and%20its%20applications",
    category: "lecture",
    snippet: "Evaluate cell voltages under variable ion concentrations, standard electrode potentials, and concentration cells.",
    keywords: ["nernst equation", "cell potential", "electrochemistry", "reference electrodes", "concentration cells"]
  },
  {
    title: "Equilibria (Acid-Base, Redox, Solubility)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Acid-base%2C%20oxidation-reduction%2C%20and%20solubility%20equilibria",
    category: "lecture",
    snippet: "Trace ionic equilibria, pH levels, buffer actions, redox half-cells, and solubility product constants (Ksp).",
    keywords: ["solubility product", "ksp", "acid-base equilibria", "ph", "buffer index", "redox titration"]
  },
  {
    title: "Water Chemistry: Hardness, Purification, and Treatment",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Water%20chemistry%3A%20hardness%2C%20purification%2C%20and%20treatment",
    category: "lecture",
    snippet: "Examine temporary and permanent water hardness, EDTA complex titrations, demineralization, and reverse osmosis.",
    keywords: ["water chemistry", "water hardness", "edta", "water purification", "zeolite process", "ion exchange", "reverse osmosis", "softening"]
  },
  {
    title: "Corrosion Mechanism, Types, and Prevention",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Corrosion%3A%20mechanism%2C%20types%2C%20and%20prevention%20methods",
    category: "lecture",
    snippet: "Understand electrochemical corrosion cells, local galvanic actions, rust formation, and cathodic protections.",
    keywords: ["corrosion", "rusting", "electro-chemical corrosion", "galvanization", "sacrificial anode", "cathodic protection"]
  },
  {
    title: "Ellingham Diagrams in Metallurgy",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Use%20of%20free%20energy%20considerations%20in%20metallurgy%20through%20Ellingham%20diagrams",
    category: "lecture",
    snippet: "Analyze temperature-dependent free energies of metal oxides to select optimal reducing agents and smelting temperatures.",
    keywords: ["ellingham diagram", "metallurgy", "reduction of oxides", "smelting", "free energy vs temperature"]
  },
  {
    title: "Effective Nuclear Charge & Slater's Rules",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Effective%20nuclear%20charge%20and%20Slater's%20rules",
    category: "lecture",
    snippet: "Calculate orbital shielding constants (sigma) and effective nuclear charges (Z*) using Slater's rules.",
    keywords: ["effective nuclear charge", "slater's rules", "shielding constant", "screening effect", "slater"]
  },
  {
    title: "Penetration of Orbitals",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Penetration%20of%20orbitals",
    category: "lecture",
    snippet: "Evaluate orbital electron density penetration near atomic nuclei in the order s > p > d > f.",
    keywords: ["orbital penetration", "shielding", "s p d f penetration"]
  },
  {
    title: "Orbital Energy Variations",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Variations%20of%20s%2C%20p%2C%20d%20and%20f%20orbital%20energies%20of%20atoms%20in%20the%20periodic%20table",
    category: "lecture",
    snippet: "Examine orbital energy levels across the periodic table, showing transitions in subshell crossings.",
    keywords: ["orbital energies", "periodic variations", "aufbau principle"]
  },
  {
    title: "Electronic Configurations of Atoms",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Electronic%20configurations%20of%20atoms",
    category: "lecture",
    snippet: "Review shell filling rules using Aufbau, Pauli exclusion, and Hund's maximum multiplicity principles.",
    keywords: ["electronic configuration", "hund's rule", "pauli exclusion principle", "aufbau"]
  },
  {
    title: "Periodic Trends: Atomic & Ionic Sizes",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Periodic%20trends%3A%20atomic%20and%20ionic%20sizes",
    category: "lecture",
    snippet: "Trace radius contractions across periods, shell increments down groups, and lanthanide contractions.",
    keywords: ["atomic radius", "ionic radius", "periodic trends", "lanthanide contraction"]
  },
  {
    title: "Periodic Trends: Ionization, Affinity, Electronegativity",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Periodic%20trends%3A%20ionization%20energies%2C%20electron%20affinity%2C%20and%20electronegativity",
    category: "lecture",
    snippet: "Study trends in electron removals (IE), electron gains (EA), and attraction scales (electronegativity).",
    keywords: ["ionization energy", "electron affinity", "electronegativity", "pauling scale", "mulliken scale"]
  },
  {
    title: "Polarizability & Fajan's Rules",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Polarizability%20and%20Fajan's%20rules",
    category: "lecture",
    snippet: "Analyze cation polarizing power and anion polarizability to determine covalent character in ionic bonds.",
    keywords: ["fajan's rules", "polarizability", "polarizing power", "covalent character", "fajan"]
  },
  {
    title: "Oxidation States and Stability",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Oxidation%20states%20and%20their%20stability",
    category: "lecture",
    snippet: "Examine variable oxidation state preferences and the inert pair effect in post-transition elements.",
    keywords: ["oxidation states", "inert pair effect", "variable valency"]
  },
  {
    title: "Coordination Numbers and Geometries",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Coordination%20numbers%20and%20geometries",
    category: "lecture",
    snippet: "Correlate metal coordination numbers (2, 4, 6) directly to complex geometries (linear, square planar, octahedral).",
    keywords: ["coordination number", "coordination chemistry", "complexes", "ligands"]
  },
  {
    title: "Hard-Soft Acids and Bases (HSAB) Concept",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Hard-Soft%20Acids%20and%20Bases%20(HSAB)%20concept",
    category: "lecture",
    snippet: "Categorize acids and bases into hard and soft classes to predict chemical stability and reaction directions.",
    keywords: ["hsab", "hard acids", "soft acids", "hard bases", "soft bases", "pearson hsab"]
  },
  {
    title: "VSEPR Theory - Molecular Geometries",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Molecular%20geometries%20(VSEPR%20theory)",
    category: "lecture",
    snippet: "Predict molecular shapes (linear, bent, tetrahedral) by accounting for lone-pair and bond-pair repulsions.",
    keywords: ["vsepr theory", "vsepr", "molecular geometry", "hybridization", "lone pairs"]
  },
  {
    title: "Representations of 3D Structures (Fischer, Newman, etc.)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Representations%20of%203D%20structures%3A%20Fischer%2C%20Newman%2C%20Sawhorse%2C%20Wedge-Dash",
    category: "lecture",
    snippet: "Convert molecular layouts between Fischer projections, Newman projections, Sawhorse forms, and Wedge-Dash styles.",
    keywords: ["fischer projection", "newman projection", "sawhorse projection", "wedge-dash", "3d representations", "fischer", "newman"]
  },
  {
    title: "Structural Isomers and Stereoisomers",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Structural%20isomers%20and%20stereoisomers",
    category: "lecture",
    snippet: "Differentiate chain, position, and functional isomers from geometrical and optical stereoisomers.",
    keywords: ["isomers", "isomerism", "structural isomers", "stereoisomers", "tautomerism"]
  },
  {
    title: "Configurations: D/L and R/S Designations",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Configurations%3A%20D%2FL%20and%20R%2FS%20designations",
    category: "lecture",
    snippet: "Assign stereochemical configurations using D/L mappings and the Cahn-Ingold-Prelog (R/S) priority rules.",
    keywords: ["r/s configuration", "d/l configuration", "absolute configuration", "cahn-ingold-prelog", "cip rules"]
  },
  {
    title: "Symmetry Elements (Plane, Center, and Axis)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Symmetry%20elements%3A%20plane%2C%20center%2C%20and%20axis%20of%20symmetry",
    category: "lecture",
    snippet: "Identify internal planes of symmetry (POS), centers of inversion (COS), and alternating axes of rotation (AOS).",
    keywords: ["symmetry elements", "plane of symmetry", "center of inversion", "axis of rotation"]
  },
  {
    title: "Chirality and Optical Activity",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Chirality%20and%20optical%20activity",
    category: "lecture",
    snippet: "Examine asymmetric carbon centers, non-superimposable mirror images, and specific rotations in polarimeters.",
    keywords: ["chirality", "optical activity", "polarimeter", "specific rotation", "enantiomeric excess"]
  },
  {
    title: "Enantiomers and Diastereomers",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Enantiomers%20and%20diastereomers",
    category: "lecture",
    snippet: "Differentiate enantiomeric mirror-image pairs from non-mirror diastereomers, meso compounds, and racemic mixtures.",
    keywords: ["enantiomers", "diastereomers", "meso compounds", "racemic mixture"]
  },
  {
    title: "Conformational Analysis of Cyclohexane",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Conformational%20analysis%20of%20cyclohexane%20(chair%20and%20boat%20conformations)",
    category: "lecture",
    snippet: "Compare stability profiles of chair and boat conformations of cyclohexane, axial/equatorial bonds, and ring flips.",
    keywords: ["cyclohexane", "chair conformation", "boat conformation", "axial bonds", "equatorial bonds", "ring flip"]
  },
  {
    title: "Isomerism in Coordination Compounds",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Isomerism%20in%20transition%20metal%20coordination%20compounds",
    category: "lecture",
    snippet: "Analyze geometrical (cis/trans, fac/mer) and optical stereoisomerism in d-block coordination complexes.",
    keywords: ["coordination compounds", "geometrical isomers", "optical isomers", "linkage isomerism"]
  },
  {
    title: "Fundamental Organic Reaction Types",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Introduction%20to%20fundamental%20organic%20reaction%20types",
    category: "lecture",
    snippet: "Examine reaction intermediate stabilities, electron displacements, and nucleophile/electrophile properties.",
    keywords: ["reaction mechanisms", "nucleophile", "electrophile", "reaction intermediates"]
  },
  {
    title: "Substitution Reactions (SN1, SN2, Electrophilic)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Substitution%20reactions%20(nucleophilic%20SN1%20and%20SN2%2C%20electrophilic)",
    category: "lecture",
    snippet: "Contrast unimolecular (SN1) carbocations against bimolecular (SN2) transitions, and electrophilic aromatic substitutions.",
    keywords: ["sn1 mechanism", "sn2 mechanism", "nucleophilic substitution", "electrophilic substitution"]
  },
  {
    title: "Addition Reactions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Addition%20reactions%20(electrophilic%2C%20nucleophilic%2C%20free%20radical)",
    category: "lecture",
    snippet: "Study electrophilic additions to alkenes (Markownikoff's Rule), nucleophilic carbonyl additions, and free radical steps.",
    keywords: ["addition reaction", "electrophilic addition", "markownikoff's rule", "nucleophilic addition"]
  },
  {
    title: "Elimination Reactions (E1 and E2 Mechanisms)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Elimination%20reactions%20(E1%20and%20E2%20mechanisms)",
    category: "lecture",
    snippet: "Compare base-induced E1 and E2 elimination pathways, transition configurations, and Saytzeff alkene preferences.",
    keywords: ["elimination reaction", "e1 mechanism", "e2 mechanism", "saytzeff's rule"]
  },
  {
    title: "Oxidation and Reduction in Organic Chemistry",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Oxidation%20and%20reduction%20reactions%20in%20organic%20chemistry",
    category: "lecture",
    snippet: "Explore organic redox conversions, selective reducing agents (LiAlH4, NaBH4), and chromium oxidants.",
    keywords: ["oxidation", "reduction", "reducing agents", "oxidizing agents", "lialh4", "nabh4"]
  },
  {
    title: "Cyclization and Ring-Opening Reactions",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Cyclization%20and%20ring-opening%20reactions",
    category: "lecture",
    snippet: "Analyze cyclic ring-closures and epoxide ring-opening reactions under acidic and basic conditions.",
    keywords: ["cyclization", "ring opening", "epoxides"]
  },
  {
    title: "Synthesis of Aspirin (acetylsalicylic acid)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Synthesis%20of%20a%20commonly%20used%20drug%20molecule%3A%20Aspirin%20(acetylsalicylic%20acid)",
    category: "lecture",
    snippet: "Trace acetylation pathways of salicylic acid using acetic anhydride to synthesize pure acetylsalicylic acid.",
    keywords: ["aspirin", "aspirin synthesis", "salicylic acid", "acetylation", "acetylsalicylic acid"]
  },
  {
    title: "Synthesis of Paracetamol (acetaminophen)",
    subjectCode: "BSCH 201",
    url: "https://chem-notes-nhm8.vercel.app/notes?topic=Synthesis%20of%20a%20commonly%20used%20drug%20molecule%3A%20Paracetamol%20(acetaminophen)",
    category: "lecture",
    snippet: "Learn industrial synthesis steps of acetaminophen starting from p-aminophenol and acetic anhydride.",
    keywords: ["paracetamol", "acetaminophen", "synthesis of paracetamol", "p-aminophenol"]
  },

  // ==========================================
  // Chemistry Laboratory (BSCH 291)
  // ==========================================
  {
    title: "Conductometric Titration of Strong Acid against Strong Base",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/#exp1",
    category: "practical",
    snippet: "Determine HCl strength by titrating against standard NaOH and tracking changes in specific conductance.",
    keywords: ["conductometric titration", "conductance", "conductivity", "resistance", "specific conductance", "cell constant", "strong acid strong base", "hcl naoh", "equivalence point", "v-shape curve"]
  },
  {
    title: "pH Metric Titration of Strong Acid against Strong Base",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/#exp2",
    category: "practical",
    snippet: "Plot sigmoidal curves to determine HCl equivalence points using glass indicators and reference calomel electrodes.",
    keywords: ["ph metric titration", "ph meter", "glass electrode", "calomel reference electrode", "sigmoidal curve", "equivalence point", "h+ concentration"]
  },
  {
    title: "Argentometric Mohr's Method for Chloride Estimation",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/#exp3",
    category: "practical",
    snippet: "Estimate chloride ions in drinking water samples by titrating with silver nitrate (AgNO3) using chromate indicators.",
    keywords: ["argentometry", "mohr's method", "chloride estimation", "silver nitrate", "agno3", "potassium chromate", "chromate indicator", "brick-red precipitate", "water chloride limit"]
  },
  {
    title: "Acid Value of Oil Titration",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/#exp4",
    category: "practical",
    snippet: "Assess triglyceride rancidity and free fatty acids in oil samples by titrating with standardized KOH solutions.",
    keywords: ["acid value", "rancidity", "free fatty acids", "koh standardization", "oxalic acid", "phenolphthalein", "alcohol-ether solvent", "triglycerides"]
  },
  {
    title: "Night Before Viva Checklist",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/#checklist",
    category: "viva",
    snippet: "Verify critical experimental endpoints, indicator colors, and buffer formulations before entering the lab.",
    keywords: ["checklist", "viva checklist", "night before viva", "viva preparation", "summary"]
  },
  {
    title: "Frequently Asked Viva Questions (Teacher May Ask)",
    subjectCode: "BSCH 291",
    url: "https://pracchem.vercel.app/#teacher-may-ask",
    category: "viva",
    snippet: "Master standard explanations, errors, and electrode mechanisms expected by external examiners.",
    keywords: ["viva questions", "teacher may ask", "viva prep", "examiner questions", "faq"]
  },

  // ==========================================
  // Mathematics-II (BSM 201)
  // ==========================================
  {
    title: "Basic Probability and Kolmogorov Axioms",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/basic-probability",
    category: "solved-problem",
    snippet: "Review Sample Spaces, Countable Additivity, Inclusion-Exclusion bounds, and Bonferroni inequalities.",
    keywords: ["basic probability", "probability space", "sample space", "event space", "kolmogorov axioms", "complement rule", "addition theorem", "inclusion-exclusion", "boole's inequality", "bonferroni's inequality"]
  },
  {
    title: "Conditional Probability & Event Independence",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/conditional-probability",
    category: "solved-problem",
    snippet: "Restricted sample space models, multiplication theorems, and pairwise vs mutual independence properties.",
    keywords: ["conditional probability", "independence", "multiplication theorem", "pairwise independence", "mutual independence"]
  },
  {
    title: "Bayes' Theorem and Prior/Posterior Probabilities",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/bayes-theorem",
    category: "solved-problem",
    snippet: "Evaluate likelihoods and reverse conditional probabilities using Bayes' rule and the Total Probability theorem.",
    keywords: ["bayes' theorem", "bayes theorem", "total probability theorem", "prior probability", "posterior probability", "likelihood"]
  },
  {
    title: "Random Variables: PMF, PDF, and CDF functions",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/pmf-pdf-cdf",
    category: "solved-problem",
    snippet: "Distinguish discrete Probability Mass functions from continuous Probability Density and Cumulative distributions.",
    keywords: ["pmf", "pdf", "cdf", "probability mass function", "probability density function", "cumulative distribution function", "random variables"]
  },
  {
    title: "Expectation, Variance, and Covariance",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/expectation-variance",
    category: "solved-problem",
    snippet: "Learn mean derivations, standard deviations, and linear transformation expectations E[aX+b].",
    keywords: ["expectation", "variance", "mathematical expectation", "mean", "standard deviation", "covariance", "expectation properties"]
  },
  {
    title: "Binomial Distribution",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/binomial",
    category: "solved-problem",
    snippet: "Derive mean (np) and variance (npq) parameters for independent Bernoulli trials.",
    keywords: ["binomial distribution", "bernoulli trials", "binomial formula", "mean of binomial", "variance of binomial"]
  },
  {
    title: "Correlation Coefficient",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/correlation",
    category: "solved-problem",
    snippet: "Calculate Pearson product-moment correlations and covariance values to analyze linear relationships.",
    keywords: ["correlation", "correlation coefficient", "pearson correlation", "covariance", "scatter plot"]
  },
  {
    title: "Linear Regression Analysis",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/regression",
    category: "solved-problem",
    snippet: "Plot lines of regression (Y on X, X on Y) and calculate regression coefficients by least squares.",
    keywords: ["regression", "linear regression", "lines of regression", "regression coefficient", "least squares method"]
  },
  {
    title: "Spearman's Rank Correlation",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/rank-correlation",
    category: "solved-problem",
    snippet: "Determine Spearman correlation factors when analyzing ordinal rankings, including adjustment factors for tied ranks.",
    keywords: ["rank correlation", "spearman rank correlation", "tied ranks"]
  },
  {
    title: "Chebyshev's Inequality Bounds",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/chebyshev-inequality",
    category: "solved-problem",
    snippet: "Evaluate upper probability boundaries for random deviations from mean averages using Chebyshev's inequality.",
    keywords: ["chebyshev's inequality", "chebyshev inequality", "probability bound", "variance bound"]
  },
  {
    title: "Poisson & Normal Gaussian Distributions",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/poisson-normal",
    category: "solved-problem",
    snippet: "Model rare event frequencies with Poisson limits, and calculate standard Z-scores under Gaussian bells.",
    keywords: ["poisson distribution", "normal distribution", "gaussian distribution", "poisson approximation", "z-score", "standard normal"]
  },
  {
    title: "Bivariate Probability Distributions",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/bivariate-distributions",
    category: "solved-problem",
    snippet: "Review joint probability tables, marginal distributions, conditional expectations, and variables independence.",
    keywords: ["bivariate distribution", "joint probability", "marginal probability", "conditional distribution"]
  },
  {
    title: "Central Tendency, Moments, and MGFs",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/central-tendency-moments",
    category: "solved-problem",
    snippet: "Compute central moments, Moment Generating functions, skewness directions, and kurtosis heights.",
    keywords: ["central tendency", "moments", "skewness", "kurtosis", "mean median mode", "moment generating function", "mgf"]
  },
  {
    title: "Curve Fitting Least Squares Approximation",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/curve-fitting",
    category: "solved-problem",
    snippet: "Fit straight lines (y = ax+b) and second-degree parabolas (y = ax^2 + bx + c) using normal equations.",
    keywords: ["curve fitting", "least squares", "parabola fitting", "straight line fitting"]
  },
  {
    title: "Large Samples Hypothesis Testing (Z-Test)",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/large-samples",
    category: "solved-problem",
    snippet: "Test statistical hypotheses on sample means and proportions (N > 30) using critical regions.",
    keywords: ["large samples", "hypothesis testing", "z-test", "null hypothesis", "alternative hypothesis", "significance level"]
  },
  {
    title: "Small Samples Hypothesis Testing (t-Test, F-Test)",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/small-samples",
    category: "solved-problem",
    snippet: "Examine differences between small group means (Student's t-distribution) and variances (Snedecor's F-test).",
    keywords: ["small samples", "student t-test", "t-test", "f-test", "degrees of freedom"]
  },
  {
    title: "Chi-Square Tests (Independence & Goodness of Fit)",
    subjectCode: "BSM 201",
    url: "https://mathsnotesbysrijeet.vercel.app/topic/chi-square-tests",
    category: "solved-problem",
    snippet: "Apply Chi-Square tests to evaluate data goodness of fit and independence of variables in contingency tables.",
    keywords: ["chi-square test", "goodness of fit", "contingency table", "independence of attributes"]
  }
];
