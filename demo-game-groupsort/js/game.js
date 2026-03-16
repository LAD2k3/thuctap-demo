const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 600,
  backgroundColor: "#3498db",
  scene: { preload: preload, create: create },
};

const game = new Phaser.Game(config);

function preload() {
  // Load ảnh từ thư mục assets (Đường dẫn tương đối không bị CORS)
  this.load.image("bg", "assets/background.svg"); // Nếu có

  window.GAME_CONFIG.groups.forEach((g) => {
    this.load.image(g.image, `assets/${g.image}.svg`);
  });
  window.GAME_CONFIG.items.forEach((i) => {
    this.load.image(i.image, `assets/${i.image}.svg`);
  });
}

function create() {
  const screenWidth = this.sys.game.config.width;
  const screenHeight = this.sys.game.config.height;

  // 1. Tạo khu vực chứa câu trả lời bên trái (Sidebar)
  const sidebar = this.add.rectangle(
    100,
    screenHeight / 2,
    200,
    screenHeight,
    0x2c3e50,
    0.5,
  );

  // 2. Tạo các cột Group bên phải
  const groups = window.GAME_CONFIG.groups;
  const zoneWidth = (screenWidth - 250) / groups.length;

  groups.forEach((groupData, index) => {
    const x = 300 + index * zoneWidth + zoneWidth / 2;

    // Vẽ đại diện Group
    this.add.image(x, 80, groupData.image).setScale(0.5);
    this.add
      .text(x, 150, groupData.name, { fontSize: "20px", fill: "#fff" })
      .setOrigin(0.5);

    // Tạo vùng Drop Zone
    const zone = this.add
      .zone(x, 400, zoneWidth - 20, 400)
      .setRectangleDropZone(zoneWidth - 20, 400);
    zone.setData("groupId", groupData.id);

    // Vẽ khung để người dùng dễ thấy vùng thả
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xffffff, 0.5);
    graphics.strokeRect(
      zone.x - zone.input.hitArea.width / 2,
      zone.y - zone.input.hitArea.height / 2,
      zone.input.hitArea.width,
      zone.input.hitArea.height,
    );
  });

  // 3. Tạo các Item có thể kéo thả
  window.GAME_CONFIG.items.forEach((itemData, index) => {
    const startX = 100;
    const startY = 100 + index * 100;

    const itemImg = this.add
      .image(startX, startY, itemData.image)
      .setInteractive({ draggable: true })
      .setScale(0.4)
      .setData("correctGroupId", itemData.groupId)
      .setData("homeX", startX)
      .setData("homeY", startY);

    // Hiển thị text tên item
    this.add
      .text(startX, startY + 40, itemData.name, { fontSize: "14px" })
      .setOrigin(0.5);

    // Sự kiện kéo thả
    this.input.setDraggable(itemImg);
  });

  // 4. Xử lý logic Drag & Drop
  this.input.on("drag", (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    gameObject.setDepth(100); // Đưa lên trên cùng khi đang kéo
  });

  this.input.on("dragend", (pointer, gameObject, dropped) => {
    if (!dropped) {
      // Nếu thả ra ngoài vùng cho phép, quay về chỗ cũ
      returnToHome(gameObject);
    }
  });

  this.input.on("drop", (pointer, gameObject, dropZone) => {
    const correctGroup = gameObject.getData("correctGroupId");
    const targetGroup = dropZone.getData("groupId");

    if (correctGroup === targetGroup) {
      // ĐÚNG: Cố định vị trí tại cột và thông báo
      gameObject.x = dropZone.x;
      gameObject.y = dropZone.y - 150 + Math.random() * 200; // Thả xếp hàng ngẫu nhiên trong cột
      gameObject.disableInteractive();
      gameObject.setDepth(1);
      showMessage(this, "CHÍNH XÁC!", "#2ecc71");
    } else {
      // SAI: Thông báo và trả về vị trí cũ
      showMessage(this, "SAI RỒI!", "#e74c3c");
      returnToHome(gameObject);
    }
  });
}

function returnToHome(gameObject) {
  gameObject.scene.tweens.add({
    targets: gameObject,
    x: gameObject.getData("homeX"),
    y: gameObject.getData("homeY"),
    duration: 500,
    ease: "Power2",
  });
}

function showMessage(scene, text, color) {
  const msg = scene.add
    .text(512, 300, text, {
      fontSize: "64px",
      fontStyle: "bold",
      fill: color,
      stroke: "#000",
      strokeThickness: 6,
    })
    .setOrigin(0.5)
    .setDepth(200);

  scene.tweens.add({
    targets: msg,
    alpha: 0,
    y: 200,
    duration: 1000,
    onComplete: () => msg.destroy(),
  });
}
