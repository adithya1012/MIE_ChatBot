import datetime
import os
from typing import Any
import httpx
from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

NWS_API_BASE = "https://api.weather.gov"
USER_AGENT = "weather-app/1.0"

MARS_BASE_API = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?"

async def make_nws_request(url):
    """Make request to NWS API with proper error handling"""
    header = {
        "User-agent" : USER_AGENT,
        "Accept" : "application/geo+json"
    }
    async with httpx.AsyncClient() as clint:
        try:
            response = await clint.get(url, headers=header, timeout=30.0)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return None

def format_alert(feature: dict) -> str:
    """Format an alert feature into a readable string."""
    props = feature["properties"]
    return f"""
    Event:{props.get ('event', 'Unknown')}
    Area: {props.get ('areaDes', 'Unknown')} 
    Severity: {props.get( 'severity', 'Unknown')}
    Description: {props.get('description', 'No description available')} 
    Instructions: {props.get('instruction', 'No specific instructions provided')}
    """

@mcp.tool()
async def get_alerts(state: str) -> str:
    """Get weather alerts for a US state.
    Args:
    state: Two-letter US state code (e.g. CA, NY)
    """
    url = f"{NWS_API_BASE}/alerts/active/area/{state}"
    data = await make_nws_request(url)
    if not data or "features" not in data:
        return "Unable to fetch alerts or no alerts found."
    if not data["features"]:
        return "No active alerts for this state."
    alerts = [format_alert(feature) for feature in data[ "features"]]
    return "\n---\n".join(alerts)


@mcp.tool()
async def get_add(a, b) -> str:
    """Gives the addition is 2 numbers
    Args:
    a: Integer
    b: Integer
    """
    return int(a)+int(b)

@mcp.tool()
async def get_mars_image(earth_date: Any = None, sol: Any = None, camera: Any = None) -> str:
    """Request to Mars Rover Image. Fetch any images on Mars Rover. Each rover has its own set of photos stored in the database, which can be queried separately. There are several possible queries that can be made against the API.\n
    Parameters:\n
        - earth_date: (optinal) Corresponding date on earth when the photo was taken. This should be in "YYYY-MM-DD" format. Default pass today's date\n
        - sol: (optinal) This is Martian sol of the Rover's mission. This is integer. Values can range from 0 to max found in endpoint. Default pass 1000.\n
        - camera: (optinal) Each camera has a unique function and perspective, and they are named as follows string:\n
            FHAZ: Front Hazard Avoidance Camera\n
            RHAZ: Rear Hazard Avoidance Camera\n
            MAST: Mast Camera\n
            CHEMCAM: Chemistry and Camera Complex\n
            MAHLI: Mars Hand Lens Imager\n
            MARDI: Mars Descent Imager\n
            NAVCAM: Navigation Camera\n
            PANCAM: Panoramic Camera\n
            MINITES: Miniature Thermal Emission Spectrometer (Mini-TES)\n
            You can use any one of the camera value at a time.\n
    """

    print(earth_date, sol, camera)
    NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")
    base_api = "https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?"
    
    # Build parameters dictionary
    params = {}
    
    # Handle mutually exclusive date/sol parameters
    if sol is not None:
        if sol < 0:
            return "Error: sol must be a non-negative integer"
        params["sol"] = str(sol)
    elif earth_date:
        # Validate date format
        try:
            datetime.datetime.strptime(earth_date, "%Y-%m-%d")
            params["earth_date"] = earth_date
        except ValueError:
            return "Error: earth_date must be in YYYY-MM-DD format"
    else:
        # Default: use sol=1000 if neither is provided
        params["sol"] = "1000"
    
    # Handle camera parameter
    if camera:
        valid_cameras = [
            "FHAZ", "RHAZ", "MAST", "CHEMCAM", "MAHLI", 
            "MARDI", "NAVCAM", "PANCAM", "MINITES"
        ]
        camera_upper = camera.upper()
        if camera_upper in valid_cameras:
            params["camera"] = camera_upper
        else:
            return f"Error: Invalid camera '{camera}'. Valid options: {', '.join(valid_cameras)}"
    
    # Build URL parameters string
    param_url = ""
    for param_key, param_value in params.items():
        param_url += f"{param_key}={param_value}&"
    
    # Add page and API key
    param_url += f"page=1&api_key={NASA_API_KEY}"
    
    # Complete URL
    api_url = base_api + param_url
    
    try:
        # Make API request
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url, timeout=30.0)
            response.raise_for_status()
            
            data = response.json()
            
            # Check if photos were found
            if not data.get("photos") or len(data["photos"]) == 0:
                return "No images are found for the specified parameters"
            
            # Return first image URL
            first_image_url = data["photos"][0]["img_src"]
            
            # Optional: return additional info
            photo_info = data["photos"][0]
            result = f"Mars Rover Image Found!\n"
            result += f"Image URL: {first_image_url}\n"
            result += f"Camera: {photo_info['camera']['full_name']} ({photo_info['camera']['name']})\n"
            result += f"Earth Date: {photo_info['earth_date']}\n"
            result += f"Sol: {photo_info['sol']}\n"
            result += f"Total photos available: {len(data['photos'])}"
            
            return result
            
    except httpx.TimeoutException:
        return "Error: Request timed out. Please try again."
    except httpx.HTTPStatusError as e:
        return f"Error: HTTP {e.response.status_code}"
    except Exception as e:
        return f"Error: {str(e)}"

if __name__ == "__main__":
    mcp.run()
