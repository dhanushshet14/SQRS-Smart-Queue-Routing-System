"""
Routing Engine for AI Smart Queue Routing System
Orchestrates the routing logic using ML predictions and business rules
"""

import numpy as np
from typing import List, Dict, Tuple
from datetime import datetime
from models.data_models import Customer, Agent, RoutingResult
from ml.routing_predictor import RoutingScorePredictor


class RoutingEngine:
    """Orchestrates the routing logic using ML predictions and business rules"""
    
    def __init__(self):
        self.predictor = RoutingScorePredictor()
        self.tie_break_threshold = 0.03
    
    def route_customers(self, customers: List[Customer], agents: List[Agent]) -> List[RoutingResult]:
        """Routes all customers to optimal agents"""
        if not customers:
            return []
        
        available_agents = [agent for agent in agents 
                          if agent.status == "available" and agent.current_workload < agent.max_concurrent]
        
        if not available_agents:
            return []
        
        # Calculate routing matrix
        routing_matrix = self._calculate_routing_matrix(customers, available_agents)
        
        # Perform optimal assignment
        assignments = self._perform_optimal_assignment(customers, available_agents, routing_matrix)
        
        # Create routing results
        results = []
        for customer_idx, agent_idx, score in assignments:
            customer = customers[customer_idx]
            agent = available_agents[agent_idx]
            
            result = RoutingResult(
                customer_id=customer.id,
                agent_id=agent.id,
                customer_name=customer.name,
                agent_name=agent.name,
                routing_score=score,
                reasoning=self._generate_reasoning(customer, agent, score),
                timestamp=datetime.now(),
                status='active'
            )
            results.append(result)
        
        return results
    
    def _calculate_routing_matrix(self, customers: List[Customer], agents: List[Agent]) -> np.ndarray:
        """Calculates RS matrix for all customer-agent combinations"""
        matrix = np.zeros((len(customers), len(agents)))
        
        for i, customer in enumerate(customers):
            for j, agent in enumerate(agents):
                score = self.predictor.predict_routing_score(customer, agent)
                matrix[i][j] = score
        
        return matrix
    
    def _perform_optimal_assignment(self, customers: List[Customer], agents: List[Agent], 
                                  routing_matrix: np.ndarray) -> List[Tuple[int, int, float]]:
        """Perform optimal customer-agent assignment using greedy approach"""
        assignments = []
        used_agents = set()
        
        # Sort customers by priority (higher priority first)
        customer_indices = list(range(len(customers)))
        customer_indices.sort(key=lambda i: customers[i].priority, reverse=True)
        
        for customer_idx in customer_indices:
            best_agent_idx = None
            best_score = -1
            
            # Find best available agent for this customer
            for agent_idx in range(len(agents)):
                if agent_idx in used_agents:
                    continue
                
                score = routing_matrix[customer_idx][agent_idx]
                
                # Check if this is the best score or within tie-break threshold
                if score > best_score:
                    best_score = score
                    best_agent_idx = agent_idx
                elif abs(score - best_score) < self.tie_break_threshold:
                    # Tie-breaking: choose less busy agent
                    current_best_agent = agents[best_agent_idx]
                    candidate_agent = agents[agent_idx]
                    
                    if candidate_agent.current_workload < current_best_agent.current_workload:
                        best_score = score
                        best_agent_idx = agent_idx
            
            if best_agent_idx is not None:
                assignments.append((customer_idx, best_agent_idx, best_score))
                used_agents.add(best_agent_idx)
        
        return assignments
    
    def _generate_reasoning(self, customer: Customer, agent: Agent, score: float) -> List[str]:
        """Generate human-readable reasoning for the routing decision"""
        reasoning = []
        
        # Score interpretation
        if score >= 0.8:
            reasoning.append("🟢 Excellent match - high success probability")
        elif score >= 0.6:
            reasoning.append("🟡 Good match - moderate success probability")
        else:
            reasoning.append("🔴 Fair match - lower success probability")
        
        # Specialty matching
        specialty_match = self.predictor._calculate_specialty_match(agent, customer)
        if specialty_match >= 0.8:
            reasoning.append(f"✅ Agent specializes in {customer.issue_type}")
        elif specialty_match >= 0.5:
            reasoning.append(f"⚡ Agent has related experience with {customer.issue_type}")
        else:
            reasoning.append(f"⚠️ Agent has limited experience with {customer.issue_type}")
        
        # Experience factor
        if agent.experience >= 5:
            reasoning.append(f"👨‍💼 Highly experienced agent ({agent.experience:.1f} years)")
        elif agent.experience >= 2:
            reasoning.append(f"👤 Experienced agent ({agent.experience:.1f} years)")
        else:
            reasoning.append(f"🆕 Junior agent ({agent.experience:.1f} years)")
        
        # Workload consideration
        workload_ratio = agent.current_workload / max(agent.max_concurrent, 1)
        if workload_ratio <= 0.3:
            reasoning.append("⚡ Agent has light workload")
        elif workload_ratio <= 0.7:
            reasoning.append("📊 Agent has moderate workload")
        else:
            reasoning.append("⏰ Agent is busy but available")
        
        # Customer factors
        if customer.tier == "premium":
            reasoning.append("👑 Premium customer - prioritized routing")
        
        if customer.sentiment == "negative":
            reasoning.append("😤 Negative sentiment - needs experienced handling")
        elif customer.sentiment == "positive":
            reasoning.append("😊 Positive sentiment - good interaction expected")
        
        return reasoning
    
    def get_routing_statistics(self, results: List[RoutingResult]) -> Dict:
        """Get statistics about routing results"""
        if not results:
            return {
                'total_routings': 0,
                'average_score': 0.0,
                'high_confidence_matches': 0,
                'medium_confidence_matches': 0,
                'low_confidence_matches': 0
            }
        
        scores = [result.routing_score for result in results]
        
        return {
            'total_routings': len(results),
            'average_score': np.mean(scores),
            'high_confidence_matches': sum(1 for s in scores if s >= 0.8),
            'medium_confidence_matches': sum(1 for s in scores if 0.6 <= s < 0.8),
            'low_confidence_matches': sum(1 for s in scores if s < 0.6),
            'score_distribution': {
                'min': min(scores),
                'max': max(scores),
                'std': np.std(scores)
            }
        }