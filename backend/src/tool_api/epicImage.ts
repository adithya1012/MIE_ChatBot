// import axios from "axios";
const axios = require("axios");

const base_api = "https://epic.gsfc.nasa.gov/api/";

export async function earth_image_api(
  params: Record<string, string>
): Promise<string> {
  try {
    // console.log("########################");
    console.log(params);
    // console.log("########################");
    console.log("Calling EARTH API FUNCTION");
    console.log(params);
    let param_url = base_api;
    if ("type" in params) {
      param_url = param_url + params["type"] + "/";
    } else {
      param_url = param_url + "natural/";
    }

    if ("earth_date" in params) {
      console.log("########################");
      const [year, month, day] = params["earth_date"].split("-");
      console.log(year, month, day);
      param_url = param_url + `date/${year}-${month}-${day}`;
      console.log(param_url);
      console.log("########################");
    }
    // console.log(param_url);
    const response = await axios.get(param_url);
    const data = response.data;
    if (!data || data.length === 0) {
      console.log(`No images found`);
      return "No images found";
    }

    const [year1, month1, day_time] = data[0]["date"].split("-");
    const [day1, time] = day_time.split(" ");
    const final_response = `https://epic.gsfc.nasa.gov/archive/${params["type"]}/${year1}/${month1}/${day1}/png/${data[0]["image"]}.png "caption:" + ${data[0]["caption"]}`;
    return final_response;

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
    // const val =
    //   "https://epic.gsfc.nasa.gov/archive/natural/2015/10/31/png/epic_1b_20151031003633.png";
    // return [val];
  } catch (error) {
    console.error("Error fetching image data:", error);
    return "Error fetching image data";
  }
}

// Example usage:
// (async () => {
//   const date = "2015-10-31"; // Replace with your date
//   const images = await getEpicImageUrlByDate(date);
//   console.log(images);
// })();
