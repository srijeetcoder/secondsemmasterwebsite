import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';

    if (!query.trim()) {
      return NextResponse.json({ success: true, results: [], aiOverview: '' });
    }

    const q = query.toLowerCase().trim();
    const searchResults: { title: string; link: string; snippet: string }[] = [];

    // Local syllabus database index
    const subjectsInfo = [
      {
        title: 'Basic CS & Programming Notes (ESCS 201)',
        link: 'https://cnotesbycsrijeet.vercel.app/',
        keywords: ['c', 'programming', 'code', 'loops', 'pointers', 'arrays', 'recursion', 'structure', 'function', 'syntax', 'sort', 'sorting', 'merge', 'search', 'searching', 'stack', 'queue', 'linked list'],
        snippet: 'C programming syntax, control structures, pointers, arrays, loops, sorting algorithms, and compiler guides.'
      },
      {
        title: 'Chemistry-I Notes (BSCH 201)',
        link: 'https://chem-notes-nhm8.vercel.app/',
        keywords: ['chemistry', 'molecular', 'kinetics', 'spectroscopy', 'thermodynamics', 'bonding', 'orbitals', 'reaction', 'ph', 'acid', 'base', 'reaction kinetics', 'molecular orbital theory'],
        snippet: 'Molecular orbital theory, organic reaction mechanisms, spectroscopy (NMR, UV, IR), and chemical kinetics.'
      },
      {
        title: 'Chemistry Laboratory Manuals (BSCH 291)',
        link: 'https://pracchem.vercel.app/',
        keywords: ['lab', 'practical', 'experiment', 'titration', 'observation', 'viva', 'manual', 'burette', 'alkalinity', 'hardness', 'water hardness', 'edta'],
        snippet: 'Practical titration sheets, lab viva sheets, water hardness calculation guides, and apparatus instructions.'
      },
      {
        title: 'Mathematics-II Solved Tutorials (BSM 201)',
        link: 'https://mathsnotesbysrijeet.vercel.app/',
        keywords: ['maths', 'mathematics', 'differential', 'equations', 'linear algebra', 'matrix', 'calculus', 'eigenvalue', 'vector', 'rank', 'determinant', 'eigenvector'],
        snippet: 'Eigenvalues/eigenvectors, systems of differential equations, linear algebra matrix solvers, and vector integration.'
      }
    ];

    // Find relevant local subject notes websites
    const queryWords = q.split(/\s+/).filter(w => w.length > 0);
    for (const info of subjectsInfo) {
      const matchesKeyword = info.keywords.some(k => {
        if (k.length === 1) {
          return queryWords.includes(k);
        }
        return queryWords.some(word => {
          const singular = word.endsWith('s') && word.length > 3 ? word.slice(0, -1) : word;
          return word === k || singular === k || k.includes(word) || k.includes(singular);
        });
      });
      if (matchesKeyword || info.title.toLowerCase().includes(q)) {
        searchResults.push({
          title: info.title,
          link: info.link,
          snippet: info.snippet,
        });
      }
    }

    // Generate Conversational LLM-Type AI Overview locally
    const aiOverview = getLocalLLMResponse(q);

    return NextResponse.json({ success: true, results: searchResults, aiOverview });

  } catch (err: any) {
    console.error('[Local Search Engine Error]:', err);
    return NextResponse.json({ success: false, error: err.message, results: [], aiOverview: '' });
  }
}

// Local conversational AI responder mapping academic queries to high-fidelity textbook-quality responses
function getLocalLLMResponse(q: string): string {
  // C Programming Topics
  if (q.includes('sort') || q.includes('merge') || q.includes('bubble')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Sorting Algorithms in C</strong></p>
      <p>Sorting is the process of arranging data in a specific order. In your <strong>ESCS 201</strong> syllabus, you focus on three main algorithms:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Bubble Sort:</strong> A simple comparison-based sort. It repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order. Time Complexity: <code>O(n²)</code>.</li>
        <li><strong>Merge Sort:</strong> A highly efficient, divide-and-conquer algorithm. It recursively splits the array in halves, sorts them, and merges them back. Time Complexity: <code>O(n log n)</code>.</li>
        <li><strong>Selection Sort:</strong> Divides the array into sorted and unsorted parts, repeatedly finds the minimum element from the unsorted part, and puts it at the beginning. Time Complexity: <code>O(n²)</code>.</li>
      </ul>
      <p><strong>C Code Example (Bubble Sort):</strong></p>
      <pre class="bg-black/35 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-white/5">
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
}</pre>
      <p>🔗 <em>Notes site covering this topic: <a href="https://cnotesbycsrijeet.vercel.app/" target="_blank" class="text-sky-400 underline">C Programming Notes</a>.</em></p>
    </div>`;
  }

  if (q.includes('pointer')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: C Pointers</strong></p>
      <p>A pointer is a variable that stores the memory address of another variable. Pointers are powerful tools in C for dynamic memory allocation and efficient array/structure handling:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Declaration:</strong> <code>int *ptr;</code> (declares a pointer to an integer).</li>
        <li><strong>Reference Operator (&):</strong> Returns the address of a variable (e.g., <code>ptr = &var;</code>).</li>
        <li><strong>Dereference Operator (*):</strong> Accesses the value stored at the address stored in the pointer.</li>
      </ul>
      <pre class="bg-black/35 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-white/5">
int x = 42;
int *ptr = &x; // Stores the address of x in ptr
printf("Address: %p\\n", ptr); // Prints hex memory address
printf("Value: %d\\n", *ptr);  // Prints 42</pre>
    </div>`;
  }

  if (q.includes('recursion') || q.includes('recursive')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Recursion in C</strong></p>
      <p>Recursion is a programming technique where a function calls itself to solve a smaller instance of the same problem. Every recursive function must contain two parts:</p>
      <ol class="list-decimal pl-5 space-y-1">
        <li><strong>Base Case:</strong> The condition under which the function stops calling itself. Without a base case, recursion results in infinite loop execution (stack overflow).</li>
        <li><strong>Recursive Case:</strong> The section where the function calls itself with modified parameters.</li>
      </ol>
      <pre class="bg-black/35 p-3 rounded-lg text-xs font-mono text-emerald-300 overflow-x-auto border border-white/5">
int factorial(int n) {
    if (n <= 1) return 1; // Base case
    return n * factorial(n - 1); // Recursive case
}</pre>
    </div>`;
  }

  // Chemistry Topics
  if (q.includes('titration') || q.includes('indicator')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Titrations & pH Indicators</strong></p>
      <p>Titration is a laboratory technique of quantitative chemical analysis used to determine the concentration of an unknown analyte using a standard solution (titrant):</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Equivalence Point:</strong> The theoretical point where the moles of titrant added equals the moles of analyte present in sample.</li>
        <li><strong>End Point:</strong> The physical point where the reaction completes, marked by a visual color change of an indicator.</li>
        <li><strong>Acid-Base Indicators:</strong>
          <ul class="list-disc pl-5 mt-1">
            <li><strong>Phenolphthalein:</strong> Acidic/Neutral (Colorless) &rarr; Basic (Pink). Transition range: pH 8.2 - 10.0.</li>
            <li><strong>Methyl Orange:</strong> Acidic (Red) &rarr; Neutral/Basic (Yellow). Transition range: pH 3.1 - 4.4.</li>
          </ul>
        </li>
      </ul>
      <p>🔗 <em>Check titration observation sheets in: <a href="https://pracchem.vercel.app/" target="_blank" class="text-sky-400 underline">Chemistry Laboratory Notes</a>.</em></p>
    </div>`;
  }

  if (q.includes('hardness') || q.includes('edta') || q.includes('water')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Estimation of Water Hardness</strong></p>
      <p>Water hardness is caused by calcium (Ca²⁺) and magnesium (Mg²⁺) ions. It is measured in terms of CaCO₃ equivalents using EDTA complexometric titration:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Titrant:</strong> Disodium salt of EDTA (Ethylene Diamine Tetraacetic Acid).</li>
        <li><strong>Indicator:</strong> Eriochrome Black T (EBT), which forms a wine-red complex with Ca²⁺/Mg²⁺. When all metal ions are complexed by EDTA, the solution changes to steel blue.</li>
        <li><strong>Buffer:</strong> Ammonium chloride-ammonium hydroxide buffer keeps the pH at 10.0, which is necessary for the stability of EBT-metal complex.</li>
      </ul>
    </div>`;
  }

  if (q.includes('molecular') || q.includes('orbital') || q.includes('mot') || q.includes('bonding')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Molecular Orbital Theory (MOT)</strong></p>
      <p>Developed by Mulliken and Hund, Molecular Orbital Theory describes the covalent bonding of molecules in terms of molecular orbitals holding electrons:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>LCAO Principle:</strong> Linear Combination of Atomic Orbitals. Atomic orbitals combine constructively to form <em>bonding orbitals</em> (lower energy) and destructively to form <em>anti-bonding orbitals</em> (higher energy).</li>
        <li><strong>Bond Order:</strong> Calculated as <code>Bond Order = 0.5 &times; (N_b - N_a)</code>, where N_b represents bonding electrons and N_a represents anti-bonding electrons.</li>
        <li><strong>Stability:</strong> If Bond Order > 0, the molecule is stable. If Bond Order = 0, the molecule does not exist (e.g., He₂).</li>
      </ul>
      <p>🔗 <em>See full energy level diagrams in: <a href="https://chem-notes-nhm8.vercel.app/" target="_blank" class="text-sky-400 underline">Chemistry-I Theory Notes</a>.</em></p>
    </div>`;
  }

  // Math Topics
  if (q.includes('matrix') || q.includes('eigen') || q.includes('linear algebra')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Matrices & Eigenvalues</strong></p>
      <p>Matrices and linear algebra are major subjects in your <strong>BSM 201</strong> (Mathematics-II) syllabus:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>Characteristic Equation:</strong> Computed as <code>det(A - &lambda;I) = 0</code> to find the eigenvalues (&lambda;).</li>
        <li><strong>Eigenvector:</strong> A non-zero vector <code>X</code> satisfying the equation <code>(A - &lambda;I)X = 0</code>.</li>
        <li><strong>Rank of a Matrix:</strong> The dimension of the vector space spanned by its columns/rows, found using Row Echelon Form.</li>
      </ul>
      <p>🔗 <em>View step-by-step matrix calculus solutions: <a href="https://mathsnotesbysrijeet.vercel.app/" target="_blank" class="text-sky-400 underline">Mathematics-II Notes</a>.</em></p>
    </div>`;
  }

  if (q.includes('differential') || q.includes('equation')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Differential Equations</strong></p>
      <p>A differential equation is an equation relating one or more functions and their derivatives. BSM 201 covers:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>First-Order Differential Equations:</strong> Solved using Variable Separable, Homogeneous, or Integrating Factor (I.F. = e^(&int;P dx)) methods.</li>
        <li><strong>Higher-Order Linear Differential Equations:</strong> Solved by finding the Complementary Function (C.F.) and Particular Integral (P.I.).</li>
        <li><strong>Applications:</strong> Modeling electrical circuits, cooling rates, and structural vibrations.</li>
      </ul>
    </div>`;
  }

  if (q.includes('spectroscopy') || q.includes('nmr') || q.includes('uv') || q.includes('ir')) {
    return `<div class="space-y-3">
      <p>💡 <strong>Local AI Guide: Spectroscopy</strong></p>
      <p>Spectroscopy studies the transition of energy levels in molecules when interacting with light:</p>
      <ul class="list-disc pl-5 space-y-1">
        <li><strong>UV-Visible:</strong> Electronic transitions (&pi; &rarr; &pi;*, n &rarr; &pi;*). Characterizes conjugation.</li>
        <li><strong>Infrared (IR):</strong> Vibrational modes (stretching, bending). Pinpoints functional groups (e.g., C=O stretch at ~1700 cm⁻¹).</li>
        <li><strong>Nuclear Magnetic Resonance (NMR):</strong> Transitions of nuclear spins in a strong magnetic field. Provides a map of structural carbons/hydrogens.</li>
      </ul>
    </div>`;
  }

  // Default fallback conversational syllabus summary
  return `<div class="space-y-3">
    <p>🤖 <strong>Local AI Syllabus Search</strong></p>
    <p>I searched your Semester 2 syllabus for <strong>"${q}"</strong>. While there is no exact topic overview page for this term, you can find related content by opening the matched subject notes websites in the carousel below.</p>
    <p><strong>Notes Portal Subjects:</strong></p>
    <ul class="list-disc pl-5 space-y-1">
      <li><strong>ESCS 201 (Basic CS):</strong> Explores pointers, arrays, recursion, stack/queue, and sorting algorithms.</li>
      <li><strong>BSCH 201/291 (Chemistry):</strong> Covers molecular orbital theory, kinetics, organic reaction mechanisms, and titration practicals.</li>
      <li><strong>BSM 201 (Math-II):</strong> Focuses on matrices, eigenvalues, vector integration, and differential equations.</li>
    </ul>
  </div>`;
}
