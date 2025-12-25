from anthropic import Anthropic
import time
from .base_provider import LLMProvider, ProviderResponse, ProviderError

class AnthropicProvider(LLMProvider):
    # Pricing per 1M tokens (December 2025)
    PRICING = {
        "claude-sonnet-4-20250514": {"input": 3.00, "output": 15.00},
        "claude-haiku-3-5-20241022": {"input": 0.80, "output": 4.00},
    }
    
    def __init__(self, api_key: str, model: str = "claude-haiku-3-5-20241022"):
        super().__init__(api_key, model)
        self.client = Anthropic(api_key=api_key)
    
    def generate(self, prompt: str, max_tokens: int = 500) -> ProviderResponse:
        start = time.time()
        
        response = self.client.messages.create(
            model=self.model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}]
        )
        
        latency = (time.time() - start) * 1000
        
        # Calculate cost
        pricing = self.PRICING[self.model]
        input_cost = (response.usage.input_tokens / 1_000_000) * pricing["input"]
        output_cost = (response.usage.output_tokens / 1_000_000) * pricing["output"]
        
        return ProviderResponse(
            content=response.content[0].text,
            model=self.model,
            tokens_used=response.usage.input_tokens + response.usage.output_tokens,
            cost=input_cost + output_cost,
            latency_ms=latency
        )
    
    def classify_error(self, error: Exception) -> ProviderError:
        error_msg = str(error).lower()
        
        if "rate_limit" in error_msg or "429" in error_msg:
            return ProviderError("rate_limit", str(error), 60)
        elif "timeout" in error_msg:
            return ProviderError("timeout", str(error))
        elif "invalid" in error_msg:
            return ProviderError("invalid_request", str(error))
        else:
            return ProviderError("api_error", str(error))
