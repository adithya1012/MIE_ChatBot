import axios from "axios";

/**
 * Get natural color EPIC image URLs by date.
 * @param date - Date in 'YYYY-MM-DD' format
 * @returns Array of image URLs
 */
export async function earth_image_api(
  params: Record<string, string>
): Promise<string[]> {
  try {
    // console.log("########################");
    // console.log(params);
    // console.log("########################");
    console.log("Calling EARTH API FUNCTION");
    // const apiUrl = `https://epic.gsfc.nasa.gov/api/natural/date/${date}`;
    // const response = await axios.get(apiUrl);
    // const data = response.data;

    // if (!data || data.length === 0) {
    //   console.log(`No images found for ${date}`);
    //   return [];
    // }

    // const [year, month, day] = date.split("-");

    // const imageUrls = data.map((item: any) => {
    //   const imageName = item.image;
    //   return `https://epic.gsfc.nasa.gov/archive/natural/${year}/${month}/${day}/png/${imageName}.png`;
    // });
    const val =
      "https://epic.gsfc.nasa.gov/archive/natural/2015/10/31/png/epic_1b_20151031003633.png";
    return [val];
  } catch (error) {
    console.error("Error fetching image data:", error);
    return [];
  }
}

// Example usage:
// (async () => {
//   const date = "2015-10-31"; // Replace with your date
//   const images = await getEpicImageUrlByDate(date);
//   console.log(images);
// })();
