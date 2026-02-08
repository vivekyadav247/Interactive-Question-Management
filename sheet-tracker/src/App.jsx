import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Loader2 } from "lucide-react";
import "./index.css";
import { useSheetStore } from "./store";
import Toolbar from "./components/Toolbar";
import StatCard from "./components/StatCard";
import TopicCard from "./components/TopicCard";
import SortableBlock from "./components/SortableBlock";
import EditorModal from "./components/EditorModal";
import { difficultyOrder, formatDate } from "./utils/ui";

const DEFAULT_BANNER =
  "https://d3hr337ydpgtsa.cloudfront.net/assets/Banner.png";

function App() {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const {
    loading,
    sheetMeta,
    topics,
    filters,
    setFilters,
    addTopic,
    updateTopic,
    deleteTopic,
    addSubTopic,
    updateSubTopic,
    deleteSubTopic,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    toggleSolved,
    reorderTopics,
    reorderSubTopics,
    reorderQuestions,
    loadSheet,
  } = useSheetStore();

  const [editor, setEditor] = useState(null);

  useEffect(() => {
    loadSheet();
  }, [loadSheet]);

  const flatQuestions = useMemo(
    () => topics.flatMap((t) => t.subTopics.flatMap((s) => s.questions)),
    [topics],
  );

  const totals = useMemo(() => {
    const base = {
      easy: { total: 0, solved: 0 },
      medium: { total: 0, solved: 0 },
      hard: { total: 0, solved: 0 },
    };
    let total = 0;
    let solved = 0;
    flatQuestions.forEach((q) => {
      const key = (q.difficulty || "Medium").toLowerCase();
      if (!base[key]) base[key] = { total: 0, solved: 0 };
      base[key].total += 1;
      total += 1;
      if (q.isSolved) {
        base[key].solved += 1;
        solved += 1;
      }
    });
    return { total, solved, byDifficulty: base };
  }, [flatQuestions]);

  const filteredTopics = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    const diff = filters.difficulty;

    return topics.map((t) => {
      const subTopics = t.subTopics.map((s) => {
        const questions = s.questions.filter((q) => {
          const matchesQuery =
            !query ||
            q.title.toLowerCase().includes(query) ||
            s.name.toLowerCase().includes(query) ||
            t.name.toLowerCase().includes(query);
          const matchesDiff =
            diff === "all" || q.difficulty.toLowerCase() === diff;
          return matchesQuery && matchesDiff;
        });
        return { ...s, questions };
      });
      return { ...t, subTopics };
    });
  }, [topics, filters]);

  const openTopicEditor = (topic) => {
    setEditor({
      type: "topic",
      title: topic ? "Edit Topic" : "New Topic",
      payload: { id: topic?.id },
      fields: [
        {
          name: "name",
          label: "Topic name",
          value: topic?.name ?? "",
          required: true,
        },
      ],
    });
  };

  const openSubEditor = (topicId, subTopic) => {
    setEditor({
      type: "subTopic",
      title: subTopic ? "Edit Sub-topic" : "New Sub-topic",
      payload: { topicId, id: subTopic?.id },
      fields: [
        {
          name: "name",
          label: "Sub-topic name",
          value: subTopic?.name ?? "",
          required: true,
        },
      ],
    });
  };

  const openQuestionEditor = (topicId, subId, question) => {
    setEditor({
      type: "question",
      title: question ? "Edit Question" : "New Question",
      payload: { topicId, subId, id: question?.id },
      fields: [
        {
          name: "title",
          label: "Title",
          value: question?.title ?? "",
          required: true,
        },
        {
          name: "difficulty",
          label: "Difficulty",
          value: question?.difficulty ?? "Medium",
          type: "select",
          options: difficultyOrder,
        },
        {
          name: "resource",
          label: "Resource URL",
          value: question?.resource ?? "",
          type: "url",
        },
        {
          name: "problemUrl",
          label: "Problem URL",
          value: question?.problemUrl ?? "",
          type: "url",
        },
      ],
    });
  };

  const handleEditorSubmit = async (form) => {
    if (!editor) return;
    const { type, payload } = editor;
    try {
      if (type === "topic") {
        if (payload.id) await updateTopic(payload.id, form.name);
        else await addTopic(form.name);
      } else if (type === "subTopic") {
        if (payload.id)
          await updateSubTopic(payload.topicId, payload.id, form.name);
        else await addSubTopic(payload.topicId, form.name);
      } else if (type === "question") {
        if (payload.id)
          await updateQuestion(
            payload.topicId,
            payload.subId,
            payload.id,
            form,
          );
        else await addQuestion(payload.topicId, payload.subId, form);
      }
      setEditor(null);
    } catch (err) {
      alert(err?.message || "Action failed");
    }
  };

  const confirmDelete = (message, fn) => {
    if (window.confirm(message)) {
      Promise.resolve(fn()).catch((err) =>
        alert(err?.message || "Action failed"),
      );
    }
  };

  return (
    <div className="min-h-screen bg-base text-white">
      <div className="max-w-7xl mx-auto px-5 py-8 space-y-6">
        <header className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  Sheet
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold">
                  {sheetMeta?.name ?? "Question Sheet"}
                </h1>
                <p className="text-muted mt-1 max-w-3xl">
                  {sheetMeta?.description}
                </p>
              </div>
            </div>
            <div className="text-xs text-muted border border-border rounded-full px-3 py-1 bg-surface">
              Last updated: {formatDate(sheetMeta?.updatedAt)}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <StatCard
              label="Overall Progress"
              value={`${totals.solved} / ${totals.total}`}
              sub={`${totals.total ? Math.round((totals.solved / totals.total) * 100) : 0}% complete`}
              tone="success"
            />
            <StatCard
              label="Easy"
              value={`${totals.byDifficulty.easy.solved} / ${totals.byDifficulty.easy.total}`}
              sub={`${totals.byDifficulty.easy.total ? Math.round((totals.byDifficulty.easy.solved / totals.byDifficulty.easy.total) * 100) : 0}% complete`}
              tone="success"
            />
            <StatCard
              label="Medium"
              value={`${totals.byDifficulty.medium.solved} / ${totals.byDifficulty.medium.total}`}
              sub={`${totals.byDifficulty.medium.total ? Math.round((totals.byDifficulty.medium.solved / totals.byDifficulty.medium.total) * 100) : 0}% complete`}
              tone="warning"
            />
            <StatCard
              label="Hard"
              value={`${totals.byDifficulty.hard.solved} / ${totals.byDifficulty.hard.total}`}
              sub={`${totals.byDifficulty.hard.total ? Math.round((totals.byDifficulty.hard.solved / totals.byDifficulty.hard.total) * 100) : 0}% complete`}
              tone="danger"
            />
          </div>
        </header>

        <Toolbar
          filters={filters}
          onSearch={(q) => setFilters({ query: q })}
          onDifficultyChange={(d) => setFilters({ difficulty: d })}
          onAddTopic={() => openTopicEditor(null)}
        />

        {loading ? (
          <div className="flex items-center gap-3 text-muted">
            <Loader2 className="animate-spin" size={20} /> Loading sheet...
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={({ active, over }) => {
              if (!over || active.id === over.id) return;
              reorderTopics(active.id, over.id);
            }}
          >
            <SortableContext
              items={filteredTopics.map((t) => t.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {filteredTopics.length === 0 ? (
                  <div className="text-muted text-sm border border-dashed border-border rounded-xl p-4">
                    No topics yet. Use "Add Topic" to begin.
                  </div>
                ) : (
                  filteredTopics.map((topic) => (
                    <SortableBlock key={topic.id} id={topic.id}>
                      <TopicCard
                        topic={topic}
                        sensors={sensors}
                        onAddSubTopic={openSubEditor}
                        onEditTopic={() => openTopicEditor(topic)}
                        onDeleteTopic={() =>
                          confirmDelete(
                            "Delete this topic and all its contents?",
                            () => deleteTopic(topic.id),
                          )
                        }
                        onEditQuestion={(tId, sId, q) =>
                          openQuestionEditor(tId, sId, q)
                        }
                        onDeleteQuestion={(tId, sId, qId) =>
                          confirmDelete("Delete this question?", () =>
                            deleteQuestion(tId, sId, qId),
                          )
                        }
                        onToggleSolved={toggleSolved}
                        onReorderSub={reorderSubTopics}
                        onReorderQuestions={reorderQuestions}
                        onDeleteSubTopic={(tId, sId) =>
                          confirmDelete("Delete this sub-topic?", () =>
                            deleteSubTopic(tId, sId),
                          )
                        }
                      />
                    </SortableBlock>
                  ))
                )}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <EditorModal
        open={!!editor}
        onClose={() => setEditor(null)}
        title={editor?.title}
        fields={editor?.fields || []}
        onSubmit={handleEditorSubmit}
        submitLabel="Save"
      />
    </div>
  );
}

export default App;
