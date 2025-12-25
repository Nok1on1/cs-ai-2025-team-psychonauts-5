import asyncio
import time
from typing import List
from .base_provider import LLMProvider, ProviderResponse, ProviderError

class SimpleRouter:
    """Dead-simple fallback chain: try each provider until one works"""
    
    def __init__(self, providers: List[LLMProvider], max_retries: int = 3):
        self.providers = providers
        self.max_retries = max_retries
    
    def generate(self, prompt: str, max_tokens: int = 500) -> ProviderResponse:
        """Try each provider in order until one succeeds"""
        
        for attempt, provider in enumerate(self.providers):
            for retry in range(self.max_retries):
                try:
                    print(f"Trying {provider.model} (attempt {retry + 1})...")
                    response = provider.generate(prompt, max_tokens)
                    print(f"✓ Success with {provider.model}")
                    return response
                
                except Exception as e:
                    error = provider.classify_error(e)
                    print(f"✗ Error: {error.error_type} - {error.message}")
                    
                    # If rate limited, wait and retry same provider
                    if error.error_type == "rate_limit" and retry < self.max_retries - 1:
                        wait_time = 2 ** retry  # Exponential backoff: 1s, 2s, 4s
                        print(f"  Waiting {wait_time}s before retry...")
                        time.sleep(wait_time)
                        continue
                    
                    # If invalid request, don't retry - fail immediately
                    if error.error_type == "invalid_request":
                        raise Exception(f"Invalid request: {error.message}")
                    
                    # Otherwise, try next provider
                    break
        
        raise Exception("All providers failed")
