import axios from 'axios';

export const bookTour = async (tourId) => {
  // 1) Get checkout session from API
  const session = await axios({
    method: 'GET',
    url: `/api/v1/bookings/checkout-session/${tourId}`,
  });
  console.log(session);
  location.assign(session.data.session.url);
};
