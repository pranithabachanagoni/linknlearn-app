import axios from 'axios';

const IMGUR_CLIENT_ID = '1fa149e784328ce'; // 👈 Put your real Client ID inside quotes ' '

export const uploadToImgur = async (base64Image: string) => {
  const response = await axios.post(
    'https://api.imgur.com/3/image',
    {
      image: base64Image,
      type: 'base64',
    },
    {
      headers: {
        Authorization: `Client-ID ${IMGUR_CLIENT_ID}`, // 👈 now it's valid
      },
    }
  );

  return response.data.data.link;
};
