# test_server.py
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("test-server")

@mcp.tool()
def simple_add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

if __name__ == "__main__":
    print("Starting test server...")  # Debug line
    mcp.run()