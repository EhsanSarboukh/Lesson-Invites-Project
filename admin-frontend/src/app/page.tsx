// src/app/page.tsx

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-500 mb-4 drop-shadow-lg animate-fade-in-down">
        Welcome to Lesson Invites 🚀
      </h2>
      <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mb-8 leading-relaxed animate-fade-in-up">
        Your go-to platform for seamless lesson scheduling. Teachers can send invites, and students can effortlessly accept or reject them, making coordination a breeze.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <a 
          href="/admin" 
          className="px-6 py-3 rounded-xl text-lg font-semibold text-white bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105 active:scale-95 shadow-md"
        >
          I'm a Teacher
        </a>
        <a 
          href="/student" 
          className="px-6 py-3 rounded-xl text-lg font-semibold text-white bg-slate-800 border-2 border-slate-700 hover:bg-slate-700 transition-colors duration-300 transform hover:scale-105 active:scale-95 shadow-md"
        >
          I'm a Student
        </a>
      </div>
    </div>
  );
}