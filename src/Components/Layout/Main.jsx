import { useState,useEffect } from 'react';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';
import Table from '../Table/Table'
import styles from './Main.module.css'

export default function Main(){

    const [imageLoaded, setImageLoaded] = useState(false);

    useEffect(() => {
        const imgDesktop = new Image();
        const imgMobile = new Image();
    
        const desktopImageURL = '/backgrounds/desktop.jpg';
        const mobileImageURL = '/backgrounds/cell.jpg';
    
        // Define URLs e pré-carrega as imagens
        imgDesktop.src = desktopImageURL;
        imgMobile.src = mobileImageURL;
    
        const handleImageLoad = () => setImageLoaded(true);
    
        imgDesktop.onload = () => {
          if (window.innerWidth > 481) handleImageLoad();
        };
    
        imgMobile.onload = () => {
          if (window.innerWidth <= 481) handleImageLoad();
        };
    
        return () => {
          imgDesktop.onload = null;
          imgMobile.onload = null;
        };
      }, []);
  
    return(
        <main className={`${styles.main} ${!imageLoaded ? styles.loading : ''}`}>
            {!imageLoaded ? (
                <div className={styles.loader}>
                    <AiOutlineLoading3Quarters className={styles.icon} />
                </div>
            ) : (
                <Table />
            )}
    </main>
    )
}