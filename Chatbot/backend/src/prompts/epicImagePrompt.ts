export const EARTH = `
## earth_image
Description: Request to Earth Image. Use this when you need fetch any images on Earth. You must provide any specific parameter requested by the user. Each parameter has its own set of photos stored in the database, which can be queried separately. There are several possible queries that can be made against the API.
Parameters:
- type: (required) This is which type of image. By default provide "natural". There are 4 differnt types available as follows:
    natural: Most Recent Natural Color image
    enhanced: Most Recent Enhanced Color image
    aerosol: Most Recent Aerosol Index image
    cloud: Most Recent Cloud Fraction image
- earth_date: (optinal) Corresponding date on earth when the photo was taken. This should be in "YYYY-MM-DD" format.
Usage:
<earth_image>
<type>type of the image</type>
<earth_date>earth date here</earth_date>
</earth_image>
`;

export const EARTH_EXAMPLE = `
## Example: Requesting for Earth image.
<earth_image>
<type>natural</type>
</earth_image>

## Example: Requesting for cloud Earth Image on April 14th 2024.
<earth_image>
<type>cloud</type>
<earth_date>2024-04-14</earth_date>
</earth_image>
`;

export const EARTH_CAPABLITY = `
Use earth_image to fetch any images on Earth only.
`;
