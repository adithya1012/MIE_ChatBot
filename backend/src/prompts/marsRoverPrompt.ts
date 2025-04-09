export const MARS_ROVER = `
## mars_rover_image
Description: Request to Mars Rover Image. Use this when you need fetch any images on Mars Rover. You must provide any specific parameter requested by the user. Each rover has its own set of photos stored in the database, which can be queried separately. There are several possible queries that can be made against the API.
Parameters:
- sol: (optinal) This is Martian sol of the Rover's mission. This is the KEY. This is integer. Values can range from 0 to max found in endpoint. 
- camera: (optinal) Each camera has a unique function and perspective, and they are named as follows:
    FHAZ: Front Hazard Avoidance Camera
    RHAZ: Rear Hazard Avoidance Camera
    MAST: Mast Camera
    CHEMCAM: Chemistry and Camera Complex
    MAHLI: Mars Hand Lens Imager
    MARDI: Mars Descent Imager
    NAVCAM: Navigation Camera
    PANCAM: Panoramic Camera
    MINITES: Miniature Thermal Emission Spectrometer (Mini-TES)
    You can use any one of the camera value at a time.
- earth_date: (optinal) Corresponding date on earth when the photo was taken. This should be in "YYYY-MM-DD" format.
Usage:
<mars_rover_image>
<sol>sol integer value here</sol>
<camera>camera value here</camera>
<earth_date>earth date here</earth_date>
</mars_rover_image>
`;

export const MARS_ROVER_EXAMPLE = `
## Example: Requesting for Mars Rover Image.
<mars_rover_image>
</mars_rover_image>

## Example: Requesting for Mars Rover Image with specific Camera and Earth date.
<mars_rover_image>
<camera>RHAZ</camera>
<earth_date>2024-03-15</earth_date>
</mars_rover_image>
`;

export const MARS_ROVER_CAPABLITY = `
Use mars_rover_image to fetch any images on Mars Rover only.
`;
