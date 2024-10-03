"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Check, Trash2, Rewind } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import confetti from "canvas-confetti";
import Image from "next/image";

interface Option {
  id: string;
  name: string;
  quantity: number;
}

interface SpinResult {
  id: string;
  winner: string;
  time: Date;
}

const COLORS = [
  "#01ff84",
  "#80ffc2",
  "#aaffd6",
  "#2ce1ff",
  "#72ebff",
  "#b9f5ff",
];

export default function LuckyWheel() {
  const [options, setOptions] = useState<Option[]>([]);
  const [newOption, setNewOption] = useState("");
  const [newQuantity, setNewQuantity] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Option | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(
    null
  );
  const [deleteOptionConfirmation, setDeleteOptionConfirmation] = useState<
    string | null
  >(null);
  const wheelRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const savedOptions = localStorage.getItem("luckyWheelOptions");
    const savedHistory = localStorage.getItem("luckyWheelHistory");
    if (savedOptions) {
      setOptions(JSON.parse(savedOptions));
    }
    if (savedHistory) {
      setHistory(
        JSON.parse(savedHistory).map((item: SpinResult) => ({
          ...item,
          time: new Date(item.time),
        }))
      );
    }
  }, []);

  useEffect(() => {
    if (options.length > 0) {
      localStorage.setItem("luckyWheelOptions", JSON.stringify(options));
    }
  }, [options]);

  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem("luckyWheelHistory", JSON.stringify(history));
    }
  }, [history]);

  const addOption = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      newOption.trim() !== "" &&
      !options.some((opt) => opt.name === newOption.trim())
    ) {
      setOptions([
        ...options,
        {
          id: Date.now().toString(),
          name: newOption.trim(),
          quantity: newQuantity,
        },
      ]);
      setNewOption("");
      setNewQuantity(1);
    }
  };

  const updateOption = (id: string, newName: string, newQuantity: number) => {
    setOptions(
      options.map((opt) =>
        opt.id === id ? { ...opt, name: newName, quantity: newQuantity } : opt
      )
    );
    setEditingId(null);
  };

  const deleteOption = (id: string) => {
    setOptions(options.filter((opt) => opt.id !== id));
    setDeleteOptionConfirmation(null);
  };

  const spinWheel = () => {
    if (spinning || options.length === 0) return;

    setSpinning(true);
    setWinner(null);

    const totalQuantity = options.reduce((sum, opt) => sum + opt.quantity, 0);
    const randomValue = Math.random() * totalQuantity;
    let accumulatedQuantity = 0;
    let winnerIndex = 0;

    for (let i = 0; i < options.length; i++) {
      accumulatedQuantity += options[i].quantity;
      if (randomValue < accumulatedQuantity) {
        // Changed from `<=` to `<`
        winnerIndex = i;
        break;
      }
    }

    // Calculate the new rotation
    const newRotation =
      rotation + 1440 + (360 - (360 * winnerIndex) / options.length); // Ensure correct calculation

    setRotation(newRotation);

    setTimeout(() => {
      const winningOption = options[winnerIndex];
      setWinner(winningOption);
      setSpinning(false);
      setShowWinnerModal(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      // Decrease quantity of winning option
      setOptions(
        options.map((opt) =>
          opt.id === winningOption.id
            ? { ...opt, quantity: Math.max(0, opt.quantity - 1) }
            : opt
        )
      );

      // Add to history
      setHistory([
        ...history,
        {
          id: Date.now().toString(),
          winner: winningOption.name,
          time: new Date(),
        },
      ]);
    }, 5000);
  };

  const deleteHistoryEntry = (id: string) => {
    setHistory(history.filter((entry) => entry.id !== id));
    setDeleteConfirmation(null);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter") {
        spinWheel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [options, spinning, rotation]);

  const getWheelColor = (index: number) => {
    return COLORS[index % COLORS.length];
  };

  const totalQuantity = options.reduce((sum, opt) => sum + opt.quantity, 0);

  return (
    <div className="flex h-screen items-center ">
      <div className=" mb-10">
        <Image
          className="object-cover w-[700px] h-[300px]"
          src="/assets/regenStation.png"
          alt="Lucky Wheel"
          width={3000}
          height={1500}
        />
      </div>
      <div className="ml-5 flex items-center justify-center w-[30rem] h-[28rem]">
        <div className="flex-auto relative w-96 h-[26rem]">
          <motion.svg
            ref={wheelRef}
            viewBox="0 0 100 100"
            className="w-full h-full"
            animate={{ rotate: rotation }}
            transition={{ duration: 5, ease: "easeOut" }}
            onClick={spinWheel}
          >
            {options.map((option, index) => {
              const startAngle = options
                .slice(0, index)
                .reduce(
                  (sum, opt) => sum + (opt.quantity / totalQuantity) * 360,
                  0
                );
              const endAngle =
                startAngle + (option.quantity / totalQuantity) * 360;
              const midAngle = (startAngle + endAngle) / 2;
              const color = getWheelColor(index);

              return (
                <g key={option.id}>
                  <motion.path
                    d={`
                        M 50 50
                        L ${50 + 50 * Math.cos((startAngle * Math.PI) / 180)} ${
                      50 + 50 * Math.sin((startAngle * Math.PI) / 180)
                    }
                        A 50 50 0 ${endAngle - startAngle > 180 ? 1 : 0} 1 ${
                      50 + 50 * Math.cos((endAngle * Math.PI) / 180)
                    } ${50 + 50 * Math.sin((endAngle * Math.PI) / 180)}
                        Z
                      `}
                    fill={color}
                    stroke="white"
                    strokeWidth="0.5"
                    whileHover={{ scale: 1.05 }}
                  />
                  <motion.text
                    x={51.5 + 25 * Math.cos((midAngle * Math.PI) / 180)}
                    y={51.5 + 25 * Math.sin((midAngle * Math.PI) / 180)}
                    fontSize="4"
                    textAnchor="middle"
                    fill="black"
                    transform={`rotate(${midAngle} ${
                      50 + 25 * Math.cos((midAngle * Math.PI) / 180)
                    } ${50 + 25 * Math.sin((midAngle * Math.PI) / 180)})`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {option.name}
                  </motion.text>
                </g>
              );
            })}
            <circle
              cx="50"
              cy="50"
              r="5"
              fill="white"
              stroke="black"
              strokeWidth="0.5"
            />
          </motion.svg>
          <svg
            viewBox="0 0 100 100"
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          >
            <text
              x="50"
              y="51.5"
              fontSize="3.5"
              fontWeight="bold"
              textAnchor="middle"
              fill="black"
              className="select-none"
            >
              SPIN
            </text>
          </svg>
          <Rewind className="h-6 w-6 absolute -top-3 left-1/2 text-[#595959] transform -rotate-90" />
        </div>
      </div>
      <div className="w-80 h-full bg-white p-4 overflow-y-auto flex flex-col fixed right-0">
        <h2 className="text-xl font-bold mb-4">Options</h2>
        <form onSubmit={addOption} className="flex flex-col gap-2 mb-4">
          <Input
            type="text"
            value={newOption}
            onChange={(e) => setNewOption(e.target.value)}
            placeholder="Add new option"
            className="flex-grow"
            required
          />
          <Input
            type="number"
            value={newQuantity}
            onChange={(e) =>
              setNewQuantity(Math.max(1, parseInt(e.target.value)))
            }
            min="1"
            placeholder="Quantity"
            className="flex-grow"
            required
          />
          <Button type="submit">
            <Plus className="h-4 w-4 mr-2" /> Add Option
          </Button>
        </form>
        <ScrollArea className="h-[40vh] flex-grow mb-4">
          {options.map((option) => (
            <div
              key={option.id}
              className="flex items-center bg-gray-100 p-2 rounded mb-2 group"
            >
              {editingId === option.id ? (
                <>
                  <Input
                    type="text"
                    defaultValue={option.name}
                    className="w-1/2 mr-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const quantityInput = e.currentTarget
                          .nextElementSibling as HTMLInputElement;
                        updateOption(
                          option.id,
                          e.currentTarget.value,
                          parseInt(quantityInput.value)
                        );
                      }
                    }}
                  />
                  <Input
                    type="number"
                    defaultValue={option.quantity}
                    min="1"
                    className="w-1/4 mr-2"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const nameInput = e.currentTarget
                          .previousElementSibling as HTMLInputElement;
                        updateOption(
                          option.id,
                          nameInput.value,
                          parseInt(e.currentTarget.value)
                        );
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => {
                      const nameInput = document.querySelector(
                        `input[type="text"][value="${option.name}"]`
                      ) as HTMLInputElement;
                      const quantityInput = document.querySelector(
                        `input[type="number"][value="${option.quantity}"]`
                      ) as HTMLInputElement;
                      updateOption(
                        option.id,
                        nameInput.value,
                        parseInt(quantityInput.value)
                      );
                    }}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <span className="flex-grow">{option.name}</span>
                  <span className="mr-2">({option.quantity})</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingId(option.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteOptionConfirmation(option.id)}
                    className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          ))}
        </ScrollArea>
        <h2 className="text-xl font-bold mb-2">History</h2>
        <ScrollArea className="h-40">
          {history
            .slice()
            .reverse()
            .map((result) => (
              <div
                key={result.id}
                className="bg-gray-100 p-2 rounded mb-2 flex justify-between items-center group"
              >
                <div>
                  <p>
                    <strong>{result.winner}</strong>
                  </p>
                  <p className="text-sm text-gray-500">
                    {result.time.toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteConfirmation(result.id)}
                  className="opacity-0 group-hover:opacity-100 hover:bg-gray-200 transition-opacity"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
        </ScrollArea>
      </div>
      <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold mb-4">{winner?.name}</p>
            {winner && winner.quantity > 1 && (
              <p>Remaining quantity: {winner.quantity - 1}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={!!deleteConfirmation}
        onOpenChange={() => setDeleteConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              history entry.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteHistoryEntry(deleteConfirmation!)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={!!deleteOptionConfirmation}
        onOpenChange={() => setDeleteOptionConfirmation(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Option</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this option? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteOption(deleteOptionConfirmation!)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
