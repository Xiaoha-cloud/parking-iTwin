# 🚗 Smart Parking Management System

Welcome to the **Smart Parking Management System**! This project leverages cutting-edge technologies like **iTwin**, **Supabase**, and **iOS** development to solve the common problem of finding parking in busy areas. Whether you're on a campus, in a city, or at an event, our smart solution will help drivers save time, reduce stress, and contribute to a cleaner environment by cutting down on unnecessary emissions.

---

## 🌟 Project Highlights

- **Real-time parking space availability** using iTwin’s powerful global display.
- **Seamless data integration** between iModel data and real-time updates via Supabase.
- **User-friendly interface** built on iTwin’s viewer for easy interaction with parking data.
- **iOS app** for convenient on-the-go access to parking information, including maps and search functionality.
- **Environmentally friendly** by reducing the need for drivers to circle parking lots, cutting emissions.

---

## 🛠️ Technologies Used

### iTwin Platform
We harnessed the power of **iTwin’s platform** to visualize parking spots in real time. The platform's **global display** lets users see available parking spaces on a map, ensuring they never have to guess or drive in circles. It provides a highly detailed view of the location and status of parking lots.

### ECSQL & iModel Data Integration
Using **ECSQL**, we built a robust real-time database that works seamlessly with **iModel data** from the iTwin platform. This integration ensures that parking information is constantly updated and synchronized, giving users access to the latest data at all times.

### Supabase for Real-Time Updates
To handle the real-time updates, we employed **Supabase**, which acts similarly to Firebase. Supabase ensures that changes in parking spot availability are instantly reflected in the system. With this setup, users can mark spots as occupied or free in real-time, keeping everyone on the same page.

### iTwin Viewer
The **iTwin Viewer** provides an interactive way for users to engage with parking data. Through this interface, users can explore parking lots, check availability, and update the status of parking spots—all with a simple click.

### iOS App Development
We developed a dedicated **iOS app** that allows users to quickly and easily find parking spots. The app features:
- A **search bar** for looking up parking lots.
- A **map view** to display detailed information about each lot, including the number of available spaces.
- Real-time updates to keep users informed on parking spot availability.
- An intuitive user experience from login to selecting a parking space.

---

## 💡 Problem Solved

Imagine arriving at a parking lot only to circle around endlessly, searching for a spot. Our system eliminates this frustration by showing available spaces in real-time. By cutting down on the time spent searching for parking, we reduce traffic congestion and pollution, creating a more efficient and environmentally-friendly parking experience.

---

## 🚀 Installation

### Backend (iTwin and Supabase Integration)

1. Clone the repository: 
    ```bash
    git clone https://github.com/Xiaoha-cloud/parking-iTwin.git
    ```
2. Navigate to the backend code:
    ```bash
    cd parking-iTwin
    ```
3. Install dependencies:
    ```bash
    npm install
    ```
4. Set up the iTwin and Supabase environment variables by following the `.env.example` file.

5. Run the server:
    ```bash
    npm start
    ```

### iOS App

1. Clone the `dev-app` branch for the iOS part of the project:
    ```bash
    git checkout dev-app
    ```
2. Open the project in Xcode and configure your **Supabase** credentials in the environment variables.

3. Run the app on a simulator or connected device.

---

## 🧑‍💻 Usage

1. Launch the backend to start the real-time parking data feed.
2. Open the iOS app and log in.
3. Use the search feature or map to find available parking spots.
4. Mark a parking spot as taken or free with a simple tap.
5. Enjoy a stress-free parking experience!

---

## 🏆 Hackathon Experience

We secured **3rd Prize** in the **Bentley iTwin4Good Championship 2024**, competing against 42 teams nationwide. This recognition highlights our innovative solution that optimized urban parking spaces and traffic flow, all made possible through the iTwin platform.

---

## 🔧 Branch Information

- The core code for iTwin’s **iViewer** integration is available in the `spa-dev` branch.
- The **iOS app** development is maintained in the `dev-app` branch.

---

## 🤝 Contribution

We welcome contributions to improve our smart parking system! To contribute, follow these steps:

1. Fork the repository.
2. Create a new feature branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes and commit them:
    ```bash
    git commit -m "Add new feature"
    ```
4. Push to the branch:
    ```bash
    git push origin feature-branch
    ```
5. Open a pull request and describe the changes.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

