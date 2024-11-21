import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
    return (
        <>
            <div>
                <Toaster
                    position="top-right"
                    toastOptions={{
                        success: {
                            theme: {
                                primary: '#4aed88', 
                            },
                        },
                    }}
                ></Toaster>
            </div>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />}></Route> {/*home page render hoga*/}
                    <Route
                        path="/editor/:roomId" /*dynamic likhna hai to : use krenge*/
                        element={<EditorPage />}
                    ></Route>
                </Routes>
            </BrowserRouter>
        </>
    );
}

export default App;
