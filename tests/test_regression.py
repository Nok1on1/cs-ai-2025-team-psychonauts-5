#!/usr/bin/env python3
"""
Regression testing for Dialogos Exam Tutor
Run with: python -m tests.test_regression
"""

import json
import time
import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Tuple
import requests
from dotenv import load_dotenv

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

load_dotenv()


class RegressionTester:
    def __init__(self, golden_set_path: str = "tests/golden_set.json"):
        self.golden_set_path = golden_set_path
        self.results = []
        self.metrics = {
            "total_queries": 0,
            "passed": 0,
            "failed": 0,
            "total_latency": 0,
            "total_cost": 0,
            "errors_by_category": {}
        }

        # Load golden set
        with open(golden_set_path, 'r') as f:
            data = json.load(f)
            self.golden_set = data["golden_set"]

    def test_query(self, test_case: Dict) -> Dict:
        """Test a single query against the system"""
        query = test_case["query"]
        test_id = test_case["id"]

        print(f"Testing {test_id}: {query[:50]}...")

        start_time = time.time()

        try:
            response = self.mock_api_call(query, test_case)

            latency = time.time() - start_time

            # Evaluate based on expected criteria
            if "expected" in test_case:
                passed = self.check_exact_match(response, test_case["expected"])
            elif "expected_keywords" in test_case:
                passed = self.check_keywords(response, test_case["expected_keywords"])
            elif "min_quality_score" in test_case:
                passed = self.check_quality_score(response, test_case["min_quality_score"])
            elif "rubric" in test_case:
                passed = self.check_rubric(response, test_case["rubric"])
            else:
                passed = False

            # Estimate cost (mock - replace with actual calculation)
            cost = self.estimate_cost(query, response)

            result = {
                "id": test_id,
                "query": query,
                "response": response,
                "passed": passed,
                "latency": latency,
                "cost": cost,
                "category": test_case.get("category", "unknown"),
                "difficulty": test_case.get("difficulty", "unknown"),
                "subject": test_case.get("subject", "unknown"),
                "topic": test_case.get("topic", "unknown")
            }

            return result

        except Exception as e:
            error_result = {
                "id": test_id,
                "query": query,
                "error": str(e),
                "passed": False,
                "latency": 0,
                "cost": 0,
                "category": test_case.get("category", "unknown")
            }
            return error_result

    def mock_api_call(self, query: str, test_case: Dict) -> str:
        """Mock API response - replace with actual implementation"""
        # Simulate different responses based on query type
        subject = test_case.get("subject", "")

        if subject == "Math":
            if "quadratic formula" in query.lower():
                return "x = [-b ± √(b² - 4ac)] / 2a"
            elif "Solve for x" in query:
                return "x = 3, y = 2"  # Generic math solution
        elif subject == "English":
            if "simile and metaphor" in query.lower():
                return "A simile uses 'like' or 'as' for comparison, while a metaphor directly states something is something else."
        elif subject == "Georgian":
            if "სახელზმანები" in query:
                return "სახელზმანები არის ზმნის განმსაზღვრელი ნაწილაკები, მაგალითად: სწრაფად, ლამაზად, ხმამაღლა."

        return "This is a mock response. Replace with actual API call."

    def check_exact_match(self, response: str, expected: str) -> bool:
        """Check if response exactly matches expected"""
        return response.strip().lower() == expected.strip().lower()

    def check_keywords(self, response: str, keywords: List[str]) -> bool:
        """Check if all keywords are present in response"""
        response_lower = response.lower()
        return all(keyword.lower() in response_lower for keyword in keywords)

    def check_quality_score(self, response: str, min_score: float) -> bool:
        """Mock quality score calculation"""
        # Replace with actual quality scoring logic
        score = 0.8  # Mock score
        return score >= min_score

    def check_rubric(self, response: str, rubric: Dict) -> bool:
        """Check against rubric criteria"""
        # Mock rubric checking
        return True

    def estimate_cost(self, query: str, response: str) -> float:
        """Estimate cost based on token count"""
        # Rough estimation: $0.0005 per 1000 tokens
        total_tokens = len(query.split()) + len(response.split())
        return (total_tokens / 1000) * 0.0005

    def run_all_tests(self) -> Dict:
        """Run all tests in golden set"""
        print(f"Running regression tests on {len(self.golden_set)} queries...")
        print("=" * 60)

        for test_case in self.golden_set:
            result = self.test_query(test_case)
            self.results.append(result)

            # Update metrics
            self.metrics["total_queries"] += 1
            if result["passed"]:
                self.metrics["passed"] += 1
                status = "✅ PASS"
            else:
                self.metrics["failed"] += 1
                status = "❌ FAIL"
                if "error" in result:
                    status += f" (Error: {result['error']})"

            self.metrics["total_latency"] += result["latency"]
            self.metrics["total_cost"] += result["cost"]

            # Update error categories
            category = result["category"]
            if not result["passed"]:
                if category not in self.metrics["errors_by_category"]:
                    self.metrics["errors_by_category"][category] = 0
                self.metrics["errors_by_category"][category] += 1

            print(f"{status} {result['id']}: Latency: {result['latency']:.2f}s, Cost: ${result['cost']:.4f}")

        return self.calculate_summary()

    def calculate_summary(self) -> Dict:
        """Calculate summary metrics"""
        if self.metrics["total_queries"] == 0:
            return {}

        summary = {
            "accuracy": (self.metrics["passed"] / self.metrics["total_queries"]) * 100,
            "avg_latency": self.metrics["total_latency"] / self.metrics["total_queries"],
            "total_cost": self.metrics["total_cost"],
            "avg_cost": self.metrics["total_cost"] / self.metrics["total_queries"],
            "error_rate": (self.metrics["failed"] / self.metrics["total_queries"]) * 100,
            "error_breakdown": self.metrics["errors_by_category"],
            "thresholds": {
                "accuracy": 80,  # Must be > 80%
                "latency": 3.0,  # Must be < 3s
                "cost": 0.003,  # Must be < $0.003 per query
                "error_rate": 5  # Must be < 5%
            }
        }

        return summary

    def print_summary(self, summary: Dict):
        """Print formatted summary"""
        print("\n" + "=" * 60)
        print("REGRESSION TEST SUMMARY")
        print("=" * 60)

        print(f"\n📊 METRICS:")
        print(f"  Total Queries: {self.metrics['total_queries']}")
        print(f"  Passed: {self.metrics['passed']}")
        print(f"  Failed: {self.metrics['failed']}")

        print(f"\n🎯 PERFORMANCE:")
        accuracy = summary["accuracy"]
        accuracy_pass = accuracy > summary["thresholds"]["accuracy"]
        print(
            f"  Accuracy: {accuracy:.1f}% (threshold: >{summary['thresholds']['accuracy']}%) {'✅ PASS' if accuracy_pass else '❌ FAIL'}")

        avg_latency = summary["avg_latency"]
        latency_pass = avg_latency < summary["thresholds"]["latency"]
        print(
            f"  Avg Latency: {avg_latency:.2f}s (threshold: <{summary['thresholds']['latency']}s) {'✅ PASS' if latency_pass else '❌ FAIL'}")

        avg_cost = summary["avg_cost"]
        cost_pass = avg_cost < summary["thresholds"]["cost"]
        print(
            f"  Avg Cost: ${avg_cost:.4f} (threshold: <${summary['thresholds']['cost']}) {'✅ PASS' if cost_pass else '❌ FAIL'}")

        error_rate = summary["error_rate"]
        error_pass = error_rate < summary["thresholds"]["error_rate"]
        print(
            f"  Error Rate: {error_rate:.1f}% (threshold: <{summary['thresholds']['error_rate']}%) {'✅ PASS' if error_pass else '❌ FAIL'}")

        print(f"\n💰 COST ANALYSIS:")
        print(f"  Total Cost: ${summary['total_cost']:.4f}")
        print(f"  Cost per Query: ${avg_cost:.4f}")

        if summary["error_breakdown"]:
            print(f"\n🔧 ERROR BREAKDOWN:")
            for category, count in summary["error_breakdown"].items():
                percentage = (count / self.metrics["failed"]) * 100
                print(f"  {category}: {count} errors ({percentage:.1f}%)")

        # Overall status
        all_pass = accuracy_pass and latency_pass and cost_pass and error_pass
        print("\n" + "=" * 60)
        if all_pass:
            print("🎉 ALL CHECKS PASSED! System is ready for production.")
        else:
            print("⚠️  SOME CHECKS FAILED. Review failures above.")
        print("=" * 60)

        return all_pass

    def save_results(self, output_path: str = "tests/regression_results.json"):
        """Save detailed results to file"""
        results_data = {
            "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "metrics": self.metrics,
            "summary": self.calculate_summary(),
            "detailed_results": self.results
        }

        with open(output_path, 'w') as f:
            json.dump(results_data, f, indent=2, default=str)

        print(f"\n📁 Detailed results saved to: {output_path}")


def main():
    """Main function to run regression tests"""
    tester = RegressionTester()

    # Run all tests
    summary = tester.run_all_tests()

    # Print summary
    all_pass = tester.print_summary(summary)

    # Save results
    tester.save_results()

    # Exit with appropriate code
    sys.exit(0 if all_pass else 1)


if __name__ == "__main__":
    main()