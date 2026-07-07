import { RouterProvider } from "react-router-dom";
import { router } from "@/routes";
import { BgmProvider } from "@/audio/BgmProvider";

export default function App() {
  return (
    <BgmProvider>
      <RouterProvider router={router} />
    </BgmProvider>
  );
}
