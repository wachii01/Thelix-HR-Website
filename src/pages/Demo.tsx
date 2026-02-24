import { Component } from "@/components/ui/button";
import { Twitter } from "lucide-react";

export default function DemoOne() {
    return (
        <div className="w-full h-screen flex items-center justify-center mx-auto relative">
            <Component
                icon={<Twitter />}
                title="Twitter"
                subtitle="Join community"
                size="md"
            />
            <div
                className="absolute w-full h-full -z-10"
                style={{
                    backgroundImage:
                        "url('data:image/svg+xml,%3Csvg width=%274%27 height=%274%27 viewBox=%270 0 6 6%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Ccircle cx=%276%27 cy=%276%27 r=%271%27 fill=%27%23aaa%27 fill-opacity=%270.25%27 /%3E%3C/svg%3E')",
                    backgroundColor: "transparent",
                }}
            ></div>
        </div>
    );
}
