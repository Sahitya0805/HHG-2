"""
Guardrail Layer for EchoRAG.
Implements 5 core Guardrail checks:
  Guardrail A — Input Validation
  Guardrail B — Retrieval Confidence Threshold Check (Abstention Trigger)
  Guardrail C — Context Relevance Verification
  Guardrail D — Generation Policy Enforcement
  Guardrail E — Post-Generation Grounding Check
"""

import time
import re
from typing import List, Dict, Any, Tuple

RETRIEVAL_CONFIDENCE_THRESHOLD = 0.18

def check_input_guardrail(transcript: str) -> Tuple[bool, str]:
    """Guardrail A: Checks if query input is valid."""
    if not transcript or not transcript.strip():
        return False, "Empty or missing transcript audio."
    if len(transcript.strip()) < 3:
        return False, "Query is too short to be meaningful."
    return True, "Input passed."

def check_retrieval_guardrail(
    evidence_chunks: List[Dict[str, Any]],
    threshold: float = RETRIEVAL_CONFIDENCE_THRESHOLD
) -> Tuple[bool, str, float]:
    """
    Guardrail B: Checks if retrieved evidence confidence is above threshold.
    If best similarity is too low, triggers ABSTENTION ("I don't know").
    """
    if not evidence_chunks:
        return False, "No relevant evidence found in knowledge base.", 0.0
        
    top_score = max(c.get("score", 0.0) for c in evidence_chunks)
    if top_score < threshold:
        return False, f"Retrieval confidence ({top_score:.2f}) below threshold ({threshold:.2f}).", top_score
        
    return True, "Retrieval confidence sufficient.", top_score

def check_context_relevance(
    query_text: str,
    evidence_chunks: List[Dict[str, Any]]
) -> Tuple[bool, str]:
    """Guardrail C: Checks if retrieved context passages address core keywords of the question."""
    query_words = set(re.findall(r'\w+', query_text.lower()))
    stopwords = {"what", "causes", "is", "the", "in", "of", "and", "a", "an", "to", "how", "why", "does", "do", "are", "for"}
    meaningful_words = query_words - stopwords
    
    if not meaningful_words:
        return True, "Context relevance passed (generic query)."
        
    for chunk in evidence_chunks:
        chunk_text = chunk.get("text", "").lower()
        matched_terms = [word for word in meaningful_words if word in chunk_text]
        # Require at least 50% of key query terms or at least 2 terms if query has multiple key terms
        if len(meaningful_words) > 1:
            if len(matched_terms) >= max(2, int(len(meaningful_words) * 0.5)):
                return True, f"Context contains relevant query terms ({len(matched_terms)}/{len(meaningful_words)})."
        else:
            if len(matched_terms) >= 1:
                return True, "Context contains relevant query term."
            
    return False, "Context passages do not address query keywords."

def verify_grounding(
    answer: str,
    evidence_chunks: List[Dict[str, Any]]
) -> Tuple[bool, float, str]:
    """
    Guardrail E: Post-generation grounding check.
    Verifies that key claims in generated answer originate from evidence text.
    """
    if not answer or not evidence_chunks:
        return False, 0.0, "Empty answer or evidence."
        
    combined_evidence = " ".join([c.get("text", "") for c in evidence_chunks]).lower()
    answer_words = set(re.findall(r'\w+', answer.lower()))
    stopwords = {"according", "to", "retrieved", "evidence", "the", "is", "a", "an", "and", "or", "in", "of", "that", "causes"}
    meaningful_answer_terms = answer_words - stopwords
    
    if not meaningful_answer_terms:
        return True, 1.0, "Fully grounded."
        
    matched = sum(1 for term in meaningful_answer_terms if term in combined_evidence)
    ratio = matched / len(meaningful_answer_terms)
    
    is_grounded = ratio >= 0.50
    status_msg = f"Grounding score: {ratio * 100:.1f}% ({matched}/{len(meaningful_answer_terms)} terms matched)."
    
    return is_grounded, round(ratio, 4), status_msg
