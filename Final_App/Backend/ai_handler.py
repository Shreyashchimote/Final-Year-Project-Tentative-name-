import os
from typing import Tuple, List, Dict, Any, Optional
import requests
from huggingface_hub import InferenceClient

class AIHandler:
    """
    Handles AI response generation using Hugging Face Inference API
    """
    
    def __init__(self, model: str = "deepseek-ai/DeepSeek-V4-Pro", api_key: Optional[str] = None):
        """
        Initialize AI handler with Hugging Face Inference API
        
        Args:
            model: Hugging Face model ID (default: deepseek-ai/DeepSeek-V4-Pro)
            api_key: Hugging Face API token (if not provided, uses HF_API_TOKEN env variable)
        """
        self.model_name = model
        self.api_key = api_key or os.getenv("HF_API_TOKEN")
        
        if not self.api_key:
            print("Warning: Hugging Face API token not found!")
            print("Set HF_API_TOKEN environment variable for real API access.")
            print("Using fallback responses until the Hugging Face token is configured.")
            self.use_fallback = True
            self.client = None
            return
        
        try:
            print(f"Initializing Hugging Face Inference API for model: {self.model_name}")
            
            # Initialize Hugging Face Inference Client
            self.client = InferenceClient(
                api_key=self.api_key,
                model=self.model_name
            )
            
            # Test the connection
            self._test_connection()
            
            print(f"Hugging Face Inference API initialized successfully!")
            self.use_fallback = False
            
        except Exception as e:
            print(f"Warning: Failed to initialize Hugging Face API: {str(e)}")
            print("Using fallback responses until the Hugging Face client is available.")
            self.use_fallback = True
            self.client = None
    
    def _test_connection(self) -> None:
        """Test connection to Hugging Face API"""
        try:
            # Simple test request
            self.client.text_generation(
                "test",
                max_new_tokens=10,
                temperature=0.7
            )
            print("✓ Connection to Hugging Face Inference API successful")
        except Exception as e:
            raise Exception(f"Failed to connect to Hugging Face API: {str(e)}")
    
    def generate_response(
        self, 
        query: str, 
        context: Optional[List[Dict[str, Any]]] = None,
        temperature: float = 0.7,
        max_tokens: int = 500
    ) -> Tuple[str, float]:
        """
        Generate an AI response for the given query using Hugging Face Inference API
        
        Args:
            query: The user's query
            context: Optional list of context documents from RAG
            temperature: Temperature for response generation (0-1)
            max_tokens: Maximum tokens in the response
        
        Returns:
            Tuple of (response_text, confidence_score)
        """
        try:
            # Prepare the prompt
            if context:
                context_text = self._format_context(context)
                prompt = (
                    f"Context:\n{context_text}\n\n"
                    f"Question: {query}\n\n"
                    f"Answer:"
                )
                confidence = self._calculate_confidence(context)
            else:
                prompt = f"Question: {query}\nAnswer:"
                confidence = 0.7
            
            if self.use_fallback:
                return self._get_fallback_response(query, context), confidence
            
            # Call Hugging Face Inference API
            response = self.client.text_generation(
                prompt,
                temperature=temperature,
                max_new_tokens=max_tokens,
                do_sample=True,
                top_p=0.95,
                top_k=50
            )
            
            # Extract and clean response
            response_text = response.strip()
            
            if not response_text:
                response_text = "I couldn't generate a response. Please try again."
            
            return response_text, confidence
        
        except Exception as e:
            raise Exception(f"Error generating response: {str(e)}")
    
    def _format_context(self, context: List[Dict[str, Any]]) -> str:
        """Format context documents for the prompt"""
        formatted = []
        
        for i, doc in enumerate(context, 1):
            content = doc.get("content", "")
            source = doc.get("source", "Unknown")
            similarity = doc.get("similarity", 0)
            
            formatted.append(
                f"[Document {i}] (Source: {source}, Similarity: {similarity:.2f})\n{content}"
            )
        
        return "\n\n".join(formatted)
    
    def _calculate_confidence(self, context: List[Dict[str, Any]]) -> float:
        """
        Calculate confidence based on context relevance
        
        Args:
            context: List of context documents
        
        Returns:
            Confidence score (0-1)
        """
        if not context:
            return 0.5
        
        # Average similarity scores
        similarities = [doc.get("similarity", 0) for doc in context]
        confidence = sum(similarities) / len(similarities)
        
        return min(confidence, 1.0)  # Cap at 1.0
    
    def _get_fallback_response(
        self, 
        query: str, 
        context: Optional[List[Dict[str, Any]]] = None
    ) -> str:
        """
        Generate a fallback response when API initialization fails.
        
        Args:
            query: The user's query
            context: Optional context documents
        
        Returns:
            Fallback response text
        """
        if context:
            sources = [doc.get("source", "unknown") for doc in context]
            return (
                f"Based on the provided context from {', '.join(sources)}, "
                f"here's an answer to your question: '{query}'. "
                f"[This is a fallback response. The Hugging Face Inference API failed to initialize. "
                f"Please check your HF_API_TOKEN environment variable.]"
            )
        else:
            return (
                f"Here's an answer to your question: '{query}'. "
                f"[This is a fallback response. The Hugging Face Inference API failed to initialize. "
                f"Please check your HF_API_TOKEN environment variable.]"
            )
