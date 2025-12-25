from openai import OpenAI
import time
from .base_provider import LLMProvider, ProviderResponse, ProviderError

class OpenAIProvider(LLMProvider):
    # Pricing per 1M tokens (December 2025)
    PRICING = {
        "gpt-4o": {"input": 2.50, "output": 10.00},
        "gpt-4o-mini": {"input": 0.15, "output": 0.60},
    }
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):
        super().__init__(api_key, model)
        self.client = OpenAI(api_key=api_key)
    
    def generate(self, prompt: str, max_tokens: int = 500) -> ProviderResponse:
        start = time.time()
        
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=max_tokens
        )
        
        latency = (time.time() - start) * 1000
        
        # Calculate cost
        pricing = self.PRICING[self.model]
        input_cost = (response.usage.prompt_tokens / 1_000_000) * pricing["input"]
        output_cost = (response.usage.completion_tokens / 1_000_000) * pricing["output"]
        
        return ProviderResponse(
            content=response.choices[0].message.content,
            model=self.model,
            tokens_used=response.usage.total_tokens,
            cost=input_cost + output_cost,
            latency_ms=latency
        )
    
    def classify_error(self, error: Exception) -> ProviderError:
        error_msg = str(error).lower()
        
        if "rate_limit" in error_msg or "429" in error_msg:
            # Extract retry-after if available
            retry_after = 60  # Default
            return ProviderError("rate_limit", str(error), retry_after)
        
        elif "timeout" in error_msg:
            return ProviderError("timeout", str(error))
        
        elif "invalid" in error_msg or "400" in error_msg:
            return ProviderError("invalid_request", str(error))
        
        else:
            return ProviderError("api_error", str(error))
