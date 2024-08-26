"use client";

import { Button } from "@/components/ui/button";
import { getOrder } from "@/services/omie";

function ButtonOMIE() {
  return (
    <Button
      onClick={() => {
        getOrder("6729");
      }}
    >
      OMIE
    </Button>
  );
}

export default ButtonOMIE;
