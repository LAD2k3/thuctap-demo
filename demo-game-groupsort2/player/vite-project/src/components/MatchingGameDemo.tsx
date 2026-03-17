import clsx from "clsx";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { MY_APP_DATA } from "../data";
import type { Group, Item } from "../types/objects";
import DraggableItem from "./DraggableItem";
import GroupColumn from "./GroupColumn";

const initialItems: Item[] = MY_APP_DATA.items;

const groups: Group[] = MY_APP_DATA.groups;

// --- MAIN COMPONENT ---
const MatchingGameDemo: React.FC = () => {
  const [unansweredItems, setUnansweredItems] = useState<Item[]>(initialItems);
  const [groupedItems, setGroupedItems] = useState<Record<string, Item[]>>({});
  const [feedback, setFeedback] = useState<{
    type: "correct" | "incorrect";
    message: string;
  } | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  const sceneRef = useRef<HTMLDivElement>(null);
  const leftContainerRef = useRef<HTMLDivElement>(null);

  // Khởi tạo groupedItems
  useEffect(() => {
    const initialGrouped: Record<string, Item[]> = {};
    groups.forEach((g) => (initialGrouped[g.id] = []));
    setGroupedItems(initialGrouped);
  }, []);

  const showFeedback = (type: "correct" | "incorrect", message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleDragStart = (itemId: string) => {
    setDraggingItemId(itemId);
  };

  // Xử lý khi kết thúc kéo
  const handleDragEnd = async (
    item: Item,
    info: PanInfo,
    _itemRef: React.RefObject<HTMLDivElement | null>,
  ): Promise<boolean> => {
    setDraggingItemId(null);

    // Xác định group được thả vào
    const droppedPoint = info.point;
    let matchedGroupId: string | null = null;

    const groupElements =
      sceneRef.current?.querySelectorAll<HTMLDivElement>("[data-group-id]");
    groupElements?.forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (
        droppedPoint.x >= rect.left &&
        droppedPoint.x <= rect.right &&
        droppedPoint.y >= rect.top &&
        droppedPoint.y <= rect.bottom
      ) {
        matchedGroupId = el.dataset.groupId || null;
      }
    });

    if (!matchedGroupId) return false;

    // Kiểm tra đúng/sai
    if (item.groupId === matchedGroupId) {
      setUnansweredItems((prev) => prev.filter((i) => i.id !== item.id));
      setGroupedItems((prev) => ({
        ...prev,
        [matchedGroupId!]: [...prev[matchedGroupId!], item],
      }));
      showFeedback("correct", "Chính xác! 🎉");
      return true;
    } else {
      showFeedback("incorrect", "Thử lại nhé! 🤔");
      return false;
    }
  };

  return (
    <div
      ref={sceneRef}
      className="w-screen h-screen overflow-hidden bg-sky-100 p-6 flex flex-col font-sans relative"
      style={{
        backgroundImage: "radial-gradient(#bbf7d0 1px, transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    >
      <header className="h-16 flex items-center justify-center mb-6 shrink-0">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight shadow-text">
          Ghép Đôi Vui Vẻ
        </h1>
      </header>

      <div className="flex-1 flex gap-8 overflow-hidden min-h-0">
        {/* Bên trái: grid 2 cột, scroll dọc */}
        <div
          ref={leftContainerRef}
          // className="w-96 h-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-yellow-300 shadow-inner overflow-y-auto"
          className="w-96 h-full bg-white/80 backdrop-blur-sm rounded-3xl p-6 border-4 border-yellow-300 shadow-inner"
        >
          <div className="grid grid-cols-2 gap-4 content-start relative">
            <AnimatePresence mode="popLayout">
              {unansweredItems.map((item) => (
                <DraggableItem
                  key={item.id}
                  item={item}
                  onDragEnd={handleDragEnd}
                  containerRef={sceneRef}
                  isDragging={draggingItemId === item.id}
                  onDragStart={handleDragStart}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Bên phải: scroll ngang */}
        <div className="flex-1 h-full flex gap-6 overflow-x-auto pb-4 custom-scrollbar-h">
          {groups.map((group) => (
            <GroupColumn
              key={group.id}
              group={group}
              items={groupedItems[group.id] || []}
            />
          ))}
        </div>
      </div>

      {/* Thông báo */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.5 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
            className={clsx(
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50",
              "px-10 py-6 rounded-full text-white text-3xl font-bold shadow-2xl",
              feedback.type === "correct" ? "bg-green-500" : "bg-red-500",
            )}
          >
            {feedback.message}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 8px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #eff6ff; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #bfdbfe; border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #60a5fa; }

        .custom-scrollbar-h::-webkit-scrollbar { height: 10px; }
        .custom-scrollbar-h::-webkit-scrollbar-track { background: #f0f9ff; border-radius: 5px; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb { background: #bae6fd; border-radius: 5px; }
        .custom-scrollbar-h::-webkit-scrollbar-thumb:hover { background: #38bdf8; }

        .shadow-text { text-shadow: 2px 2px 0px rgba(255,255,255,0.8); }
      `}</style>
    </div>
  );
};

export default MatchingGameDemo;
