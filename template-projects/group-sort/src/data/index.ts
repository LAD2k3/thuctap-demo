import type { Group, Item } from "../types/objects";

// --- Dữ liệu mẫu ---
export const _APP_DATA: { groups: Group[]; items: Item[] } =
  import.meta.env.PROD &&
  (
    window as Window &
      typeof globalThis & { MY_APP_DATA: { groups: Group[]; items: Item[] } }
  )["MY_APP_DATA"]
    ? (
        window as Window &
          typeof globalThis & {
            MY_APP_DATA: { groups: Group[]; items: Item[] };
          }
      )["MY_APP_DATA"]
    : {
        groups: [
          { id: "group1", name: "Trái cây", imagePath: "🍎" },
          { id: "group2", name: "Rau củ", imagePath: "🥕" },
          { id: "group3", name: "Động vật", imagePath: "🦁" },
          { id: "group4", name: "Phương tiện", imagePath: "🚗" },
          { id: "group5", name: "Đồ dùng học tập", imagePath: "📚" },
          { id: "group6", name: "Thể thao", imagePath: "⚽" },
        ],
        items: [
          // Trái cây
          { id: "item1", name: "Táo", imagePath: "🍎", groupId: "group1" },
          { id: "item2", name: "Chuối", imagePath: "🍌", groupId: "group1" },
          { id: "item3", name: "Cam", imagePath: "🍊", groupId: "group1" },
          { id: "item4", name: "Nho", imagePath: "🍇", groupId: "group1" },
          { id: "item5", name: "Dâu", imagePath: "🍓", groupId: "group1" },
          { id: "item6", name: "Dưa hấu", imagePath: "🍉", groupId: "group1" },

          // Rau củ
          { id: "item7", name: "Cà rốt", imagePath: "🥕", groupId: "group2" },
          {
            id: "item8",
            name: "Khoai tây",
            imagePath: "🥔",
            groupId: "group2",
          },
          { id: "item9", name: "Bông cải", imagePath: "🥦", groupId: "group2" },
          { id: "item10", name: "Ngô", imagePath: "🌽", groupId: "group2" },
          { id: "item11", name: "Cà tím", imagePath: "🍆", groupId: "group2" },

          // Động vật
          { id: "item12", name: "Sư tử", imagePath: "🦁", groupId: "group3" },
          { id: "item13", name: "Hổ", imagePath: "🐯", groupId: "group3" },
          { id: "item14", name: "Voi", imagePath: "🐘", groupId: "group3" },
          { id: "item15", name: "Khỉ", imagePath: "🐵", groupId: "group3" },
          {
            id: "item16",
            name: "Gấu trúc",
            imagePath: "🐼",
            groupId: "group3",
          },
          { id: "item17", name: "Chim", imagePath: "🐦", groupId: "group3" },

          // Phương tiện
          { id: "item18", name: "Ô tô", imagePath: "🚗", groupId: "group4" },
          { id: "item19", name: "Xe buýt", imagePath: "🚌", groupId: "group4" },
          { id: "item20", name: "Máy bay", imagePath: "✈️", groupId: "group4" },
          { id: "item21", name: "Tàu hỏa", imagePath: "🚂", groupId: "group4" },
          { id: "item22", name: "Xe máy", imagePath: "🏍️", groupId: "group4" },
          { id: "item23", name: "Tên lửa", imagePath: "🚀", groupId: "group4" },

          // Đồ dùng học tập
          { id: "item24", name: "Sách", imagePath: "📖", groupId: "group5" },
          { id: "item25", name: "Bút chì", imagePath: "✏️", groupId: "group5" },
          { id: "item26", name: "Balo", imagePath: "🎒", groupId: "group5" },
          {
            id: "item27",
            name: "Thước kẻ",
            imagePath: "📏",
            groupId: "group5",
          },
          { id: "item28", name: "Kéo", imagePath: "✂️", groupId: "group5" },
          { id: "item29", name: "Bảng", imagePath: "📋", groupId: "group5" },

          // Thể thao
          { id: "item30", name: "Bóng đá", imagePath: "⚽", groupId: "group6" },
          { id: "item31", name: "Bóng rổ", imagePath: "🏀", groupId: "group6" },
          {
            id: "item32",
            name: "Bóng chuyền",
            imagePath: "🏐",
            groupId: "group6",
          },
          {
            id: "item33",
            name: "Vợt tennis",
            imagePath: "🎾",
            groupId: "group6",
          },
          {
            id: "item34",
            name: "Gậy golf",
            imagePath: "⛳",
            groupId: "group6",
          },
          {
            id: "item35",
            name: "Huy chương",
            imagePath: "🏅",
            groupId: "group6",
          },
        ],
      };

function normalizeAppData(data: { groups: Group[]; items: Item[] }) {
  return {
    groups: data.groups.map((g) => ({
      ...g,
      imagePath: g.imagePath && g.imagePath.trim() !== "" ? g.imagePath : null,
    })),
    items: data.items.map((i) => ({
      ...i,
      imagePath: i.imagePath && i.imagePath.trim() !== "" ? i.imagePath : null,
    })),
  };
}

export const MY_APP_DATA = normalizeAppData(_APP_DATA);
