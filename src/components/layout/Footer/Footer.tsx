import { Link } from 'react-router-dom';
import styles from './Footer.module.css';

interface FooterProps {
  /** 사이드바 포함 여부 */
  hasSidebar?: boolean;
}

export function Footer({ hasSidebar = false }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerClasses = [
    styles.footer,
    hasSidebar && styles.footerWithSidebar,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <footer className={footerClasses} role="contentinfo">
      <div className={styles.footerContent}>
        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>Hello Front</h3>
          <p className={styles.copyright}>
            React + TypeScript 학습 프로젝트
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3 className={styles.footerTitle}>링크</h3>
          <nav className={styles.footerLinks}>
            <Link to="/" className={styles.footerLink}>
              홈
            </Link>
            <Link to="/playground" className={styles.footerLink}>
              Playground
            </Link>
            <Link to="/about" className={styles.footerLink}>
              About
            </Link>
          </nav>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          © {currentYear} Hello Front. MIT License.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
