import { useSelector } from 'react-redux';
import { ProfilePost } from '../components/index';
import { UserData } from '../interfaces';

export default function ProfilePage() {
    // Getting user data from store with proper typing
    const userData = useSelector((state: UserData) => state.auth.userData);

    // Function to get greeting based on time.
    const getGreeting = () => {
        const now = new Date();
        const hour = now.getHours();
        const userName = userData?.name || '';

        if (hour < 12) {
            return <p>Good morning <span className="text-blue-400 font-semibold">{userName} 😘</span></p>;
        } else if (hour < 18) {
            return <p>Good afternoon <span className="text-yellow-400 font-semibold">{userName} 😘</span></p>;
        } else {
            return <p>Good evening <span className="text-blue-400 font-semibold">{userName} 😘</span></p>;
        }
    };

    return (
        <div className="w-screen mx-auto pb-10 relative">
            <div
                className="w-[1100px] max-w-[90%] mx-auto"
            >
                <div className="text-3xl">
                    {getGreeting()}
                </div>
            </div>

            <div className="relative min-h-[60vh]">
                <ProfilePost userId={userData?.$id || ''} />
            </div>
        </div>
    );
};
