# Studio Scheduling App

This project is a Studio Scheduling App that allows producers to book days for their appointments. The application ensures that once a day has been booked, it cannot be booked by another user. The UI is designed with glassmorphism to create a fun and interactive experience.

## Features

- **Calendar Interface**: Users can select dates for booking and see which dates are already booked.
- **Booking Form**: A user-friendly form for submitting booking details, including the date and additional information.
- **Booking List**: Displays a list of all booked dates, making it easy for users to see existing bookings.
- **Glassmorphism Design**: The application uses modern design techniques to create an appealing visual experience.

## Project Structure

```
studio-scheduling-app
├── public
│   └── vite.svg
├── src
│   ├── assets
│   │   └── react.svg
│   ├── components
│   │   ├── Calendar.jsx
│   │   ├── BookingForm.jsx
│   │   └── BookingList.jsx
│   ├── styles
│   │   └── glassmorphism.css
│   ├── App.jsx
│   ├── main.jsx
│   ├── index.css
│   └── utils
│       └── bookings.js
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## Getting Started

1. **Clone the repository**:
   ```
   git clone <repository-url>
   cd studio-scheduling-app
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Run the application**:
   ```
   npm run dev
   ```

4. **Open your browser** and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.#   s t u d i o - s c h e d u l i n g - a p p 

## Google drive setup

This is how to setup and use the google drive upload feature within the app:

1. **Generate the service key**
   Go to the Google Cloud Console.
   Open your project.
   Go to APIs & Services > Credentials.
   Under Service Accounts, find your service account (or create one if needed).
   Click the service account, then Add Key > Create new key > JSON.(service-key.json).
   Download the JSON file.
   Place the File in the Correct Location in your folder structure within your IDE.
3. **Activate the Google Drive API**
4. **Create a folder on your google drive**
5. **Retrieve the folder's ID and share it with your service account's email**

## How to setup the Google sign in Authentication process.
1. Go to Google Cloud Console > APIs & Services > Credentials.
2. Find your OAuth 2.0 Client ID.
3. Edit it and add your local development URL (e.g., http://localhost:5173 or http://localhost:3000) to the Authorized JavaScript origins.
4. Save and restart your frontend.
 
 
