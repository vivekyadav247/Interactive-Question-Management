const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// single source of truth: root-level sheet.json (one directory up from backend/)
const DATA_PATH = path.join(__dirname, "..", "sheet.json");
const SOURCE_PATH = DATA_PATH;

const uid = () => uuidv4();

const normalizeDifficulty = (raw) => {
  if (!raw) return "Medium";
  const v = raw.toLowerCase();
  if (v === "basic") return "Easy";
  if (v === "easy") return "Easy";
  if (v === "medium") return "Medium";
  if (v === "hard") return "Hard";
  return raw;
};

const buildFromSheet = (json) => {
  const sheet = json?.data?.sheet ?? json?.sheet ?? {};
  const questions = json?.data?.questions ?? json?.questions ?? [];
  const topicMap = new Map();

  questions.forEach((item) => {
    const topicName = item.topic?.trim() || "Untitled Topic";
    const subName = item.subTopic?.trim() || "General";

    if (!topicMap.has(topicName)) {
      topicMap.set(topicName, { id: uid(), name: topicName, subTopics: [] });
    }
    const topic = topicMap.get(topicName);
    let sub = topic.subTopics.find((s) => s.name === subName);
    if (!sub) {
      sub = { id: uid(), name: subName, questions: [] };
      topic.subTopics.push(sub);
    }
    sub.questions.push({
      id: item._id ?? uid(),
      title: item.title || item.questionId?.name || "Untitled Question",
      difficulty: normalizeDifficulty(item.questionId?.difficulty),
      resource: item.resource || item.questionId?.problemUrl || "",
      problemUrl: item.questionId?.problemUrl || "",
      isSolved: Boolean(item.isSolved),
    });
  });

  return {
    meta: {
      name: sheet.name ?? "Question Sheet",
      description: sheet.description ?? "",
      updatedAt: sheet.updatedAt ?? sheet.createdAt ?? "",
      slug: sheet.slug ?? "",
    },
    topics: Array.from(topicMap.values()),
  };
};

const readData = () => {
  if (!fs.existsSync(DATA_PATH)) return { meta: {}, topics: [] };
  const raw = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  // If already in { meta, topics } shape, use it; otherwise build from seed format.
  if (raw && raw.meta && raw.topics) return raw;
  const built = buildFromSheet(raw);
  fs.writeFileSync(DATA_PATH, JSON.stringify(built, null, 2));
  return built;
};

const writeData = (payload) => {
  db = payload;
  fs.writeFileSync(DATA_PATH, JSON.stringify(payload, null, 2));
};

const arrayMove = (arr, from, to) => {
  const clone = [...arr];
  const [item] = clone.splice(from, 1);
  clone.splice(to, 0, item);
  return clone;
};

let db = readData();

const getDb = () => db;

module.exports = {
  uid,
  normalizeDifficulty,
  arrayMove,
  getDb,
  writeData,
};
