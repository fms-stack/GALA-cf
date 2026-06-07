import { useLocation, useOutlet } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Wraps <Outlet/> with cinematic page transitions.
 * - Curtain wipe (noir veil that rises from bottom)
 * - Content fades + slides up softly
 */
export default function PageTransition() {
  const location = useLocation();
  const element = useOutlet();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -16 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {element}
      </motion.div>
    </AnimatePresence>
  );
}
