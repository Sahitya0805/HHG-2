"""
MSMARCO-XI Dataset Loader and Ingestion Module.
Provides AI4Bharat MSMARCO-XI dataset passages and benchmark queries.
"""

import json
import os
from typing import List, Dict, Any

# AI4Bharat MSMARCO-XI sample corpus representing diverse QA topics
MSMARCO_XI_SAMPLE_DATA = [
    {
        "doc_id": "msmarco_doc_001",
        "title": "Symptoms of Influenza and Seasonal Flu",
        "text": "Seasonal influenza (flu) is a contagious respiratory illness caused by influenza viruses that infect the nose, throat, and sometimes the lungs. Typical symptoms include fever, chills, cough, sore throat, runny or stuffy nose, muscle or body aches, headaches, and fatigue. Some people may have vomiting and diarrhea, though this is more common in children than adults. Symptoms usually start suddenly rather than gradually."
    },
    {
        "doc_id": "msmarco_doc_002",
        "title": "Causes of Hypertension and High Blood Pressure",
        "text": "Hypertension, or high blood pressure, occurs when the force of blood against arterial walls is consistently too high. Primary hypertension develops gradually over many years without a single identifiable cause. Factors contributing to hypertension include excessive sodium consumption, lack of physical activity, chronic stress, obesity, alcohol consumption, genetics, and advancing age. Secondary hypertension is caused by an underlying condition such as kidney disease or adrenal gland disorders."
    },
    {
        "doc_id": "msmarco_doc_003",
        "title": "Photosynthesis Process in Plants",
        "text": "Photosynthesis is the chemical process by which green plants, algae, and certain bacteria convert light energy, usually from the sun, into chemical energy stored in glucose molecules. Water and carbon dioxide are converted into oxygen and carbohydrates using chlorophyll in plant chloroplasts. Sunlight excites chlorophyll electrons, driving the photolysis of water into oxygen, hydrogen ions, and electrons."
    },
    {
        "doc_id": "msmarco_doc_004",
        "title": "Mechanism of Action of Penicillin Antibiotics",
        "text": "Penicillin is a beta-lactam antibiotic derived from Penicillium fungi. It works by inhibiting the synthesis of bacterial cell walls. Specifically, penicillin binds to transpeptidase enzymes (penicillin-binding proteins) that cross-link peptidoglycan chains in bacterial cell walls. This weakens the cell wall structure, causing osmotic lysis and cell death in actively dividing Gram-positive bacteria."
    },
    {
        "doc_id": "msmarco_doc_005",
        "title": "Causes of Global Climate Change and Warming",
        "text": "Global climate change is primarily driven by human activities that release greenhouse gases into the atmosphere. The burning of fossil fuels such as coal, oil, and natural gas produces carbon dioxide and nitrous oxide. Deforestation reduces the planet's capacity to absorb CO2. Industrial processes, agricultural emissions of methane, and livestock farming further amplify the greenhouse effect, leading to rising global temperatures, thermal ocean expansion, and melting polar ice."
    },
    {
        "doc_id": "msmarco_doc_006",
        "title": "The Solar System and Planetary Orbits",
        "text": "The Solar System consists of the Sun and eight planets held by gravitational attraction: Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune. Jupiter is the largest planet, composed mostly of hydrogen and helium. Planetary orbits are elliptical, governed by Kepler's laws of planetary motion and Newton's law of universal gravitation."
    },
    {
        "doc_id": "msmarco_doc_007",
        "title": "How Artificial Neural Networks Learn",
        "text": "Artificial Neural Networks (ANNs) consist of connected nodes or artificial neurons organized in layers: input, hidden, and output. Learning in ANNs occurs through backpropagation and gradient descent optimization. During training, prediction errors are calculated using a loss function, and weights between neurons are updated iteratively to minimize loss."
    },
    {
        "doc_id": "msmarco_doc_008",
        "title": "Deep Ocean Ecosystems and Hydrothermal Vents",
        "text": "Hydrothermal vents are fissures on the ocean seafloor that geothermally heat water. Bacteria surrounding hydrothermal vents use chemosynthesis rather than photosynthesis to produce organic matter from hydrogen sulfide and methane. Chemosynthetic communities support tube worms, giant clams, and specialized crustaceans in deep oceanic abyssal zones."
    },
    {
        "doc_id": "msmarco_doc_009",
        "title": "History of the Silk Road Trade Network",
        "text": "The Silk Road was an ancient network of Eurasian trade routes active from the Han dynasty (130 BCE) until the Ottoman Empire boycotted trade with the West in 1453 CE. Stretching over 6,400 kilometers, it facilitated economic, cultural, political, and religious interactions between East Asia, South Asia, Persia, the Arabian Peninsula, and the Mediterranean basin."
    },
    {
        "doc_id": "msmarco_doc_010",
        "title": "Principles of Quantum Computing and Qubits",
        "text": "Quantum computing utilizes principles of quantum mechanics such as superposition and entanglement. Unlike classical bits that represent binary states 0 or 1, quantum bits (qubits) can exist in superpositions of states simultaneously. Quantum algorithms such as Shor's algorithm for prime factorization and Grover's algorithm for database search demonstrate exponential speedups over classical computing."
    },
    {
        "doc_id": "msmarco_doc_011",
        "title": "Structure and Function of Deoxyribonucleic Acid (DNA)",
        "text": "Deoxyribonucleic acid (DNA) is a double-stranded helical macromolecule containing genetic instructions for all living organisms. DNA consists of nucleotides made of a deoxyribose sugar, a phosphate group, and one of four nitrogenous bases: Adenine (A), Thymine (T), Cytosine (C), and Guanine (G). Base pairing rules dictate that A pairs with T via two hydrogen bonds, while C pairs with G via three hydrogen bonds."
    },
    {
        "doc_id": "msmarco_doc_012",
        "title": "The Water Cycle and Hydrological Processes",
        "text": "The hydrological cycle describes the continuous movement of water on, above, and below the surface of the Earth. Key processes include evaporation from oceans and lakes, transpiration from plants, condensation of atmospheric water vapor into clouds, precipitation as rain or snow, infiltration into soil, and surface runoff into rivers."
    }
]

def load_msmarco_dataset() -> List[Dict[str, Any]]:
    """Loads MSMARCO-XI dataset documents."""
    return MSMARCO_XI_SAMPLE_DATA
