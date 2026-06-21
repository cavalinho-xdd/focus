import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Play, Plus, Trash2, Paperclip, Clock, X } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, addDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';

function FocusBacklog({ onStartFocus }) {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskMinutes, setNewTaskMinutes] = useState(25);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, `users/${auth.currentUser.uid}/tasks`),
      where('completed', '==', false),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tasksData = [];
        snapshot.forEach((d) => tasksData.push({ id: d.id, ...d.data() }));
        setTasks(tasksData);
      },
      (err) => console.error('Tasks snapshot error:', err)
    );

    return () => unsubscribe();
  }, []);

  const handleSelectFile = async () => {
    if (window.api?.system) {
      const file = await window.api.system.openFileDialog();
      if (file) setSelectedFile(file);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !auth.currentUser) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, `users/${auth.currentUser.uid}/tasks`), {
        title: newTaskTitle,
        minutes: parseInt(newTaskMinutes, 10) || 25,
        filePath: selectedFile?.path || null,
        fileName: selectedFile?.name || null,
        completed: false,
        createdAt: serverTimestamp(),
      });
      setNewTaskTitle('');
      setNewTaskMinutes(25);
      setSelectedFile(null);
      setShowModal(false);
    } catch (err) {
      console.error('Error adding task: ', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, `users/${auth.currentUser.uid}/tasks`, taskId));
    } catch (err) {
      console.error('Error deleting task: ', err);
    }
  };

  const totalMinutes = tasks.reduce((acc, t) => acc + (t.minutes || 0), 0);

  return (
    <div className="w-full flex flex-col h-full relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">{t('backlog.title')}</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-gray-400 font-light">{t('backlog.subtitle')}</p>
            {tasks.length > 0 && (
              <>
                <span className="text-gray-700 text-xs">·</span>
                <span className="text-xs text-gray-600 font-mono tabular-nums">
                  {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {totalMinutes}m queued
                </span>
              </>
            )}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-focus-primary text-white px-5 py-2.5 rounded-full font-medium shadow-glow-cta hover:shadow-glow-cta-hover transition-shadow duration-150 ease-ui-out shrink-0"
        >
          <Plus size={18} />
          {t('backlog.addTask')}
        </motion.button>
      </div>

      {/* Task list */}
      <div className="flex-1 overflow-y-auto px-2 -mx-2 custom-scrollbar space-y-3 pb-10">
        <AnimatePresence mode="popLayout">

          {/* Empty state — acts as an invitation */}
          {tasks.length === 0 && (
            <motion.button
              key="empty"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              onClick={() => setShowModal(true)}
              className="w-full flex flex-col items-center justify-center py-20 rounded-2xl
                border-2 border-dashed border-white/[0.06]
                hover:border-focus-primary/20 hover:bg-focus-primary/[0.025]
                transition-all duration-300 cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-focus-primary/10
                flex items-center justify-center mb-4
                text-gray-600 group-hover:text-focus-primary/70
                transition-all duration-300">
                <Plus size={22} />
              </div>
              <p className="text-gray-500 group-hover:text-gray-400 text-sm font-medium transition-colors">
                {t('backlog.noTasks')}
              </p>
              <p className="text-gray-700 text-xs mt-1 group-hover:text-gray-600 transition-colors">
                Click to add your first task
              </p>
            </motion.button>
          )}

          {/* Task cards */}
          {tasks.map((task, index) => (
            <motion.div
              layout
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -16, scale: 0.96 }}
              transition={{
                layout: { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
                default: { delay: index * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] },
              }}
              whileHover={{ scale: 1.008 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onStartFocus({
                taskId: task.id,
                topic: task.title,
                minutes: task.minutes,
                filePath: task.filePath,
                hardcore: false,
                usePomodoro: false,
                pomodoroFocus: 25,
                pomodoroBreak: 5,
              })}
              className="group relative flex items-center gap-5 p-5 rounded-2xl overflow-hidden cursor-pointer
                bg-white/[0.03] border border-white/[0.06]
                hover:bg-white/[0.07] hover:border-focus-primary/20
                hover:shadow-[0_12px_40px_rgba(139,92,246,0.09),inset_0_0_0_1px_rgba(139,92,246,0.13)]
                transition-all duration-200 ease-ui-out"
            >
              {/* Shimmer sweep on hover — purely decorative, suppressed by reduced-motion CSS */}
              <div
                aria-hidden="true"
                className="absolute inset-0 -translate-x-full group-hover:translate-x-full
                  bg-gradient-to-r from-transparent via-white/[0.018] to-transparent
                  transition-transform duration-700 ease-in-out pointer-events-none"
              />

              {/* Play button — the hero action */}
              <div className="relative shrink-0">
                <div
                  className="w-14 h-14 rounded-full bg-focus-primary/15 flex items-center justify-center text-focus-primary
                    group-hover:bg-focus-primary/28
                    group-hover:shadow-[0_0_0_8px_rgba(139,92,246,0.07),0_0_28px_rgba(139,92,246,0.28)]
                    transition-all duration-200 ease-ui-out"
                >
                  <Play
                    size={22}
                    fill="currentColor"
                    className="ml-0.5 group-hover:scale-110 transition-transform duration-200"
                  />
                </div>
              </div>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-white group-hover:text-focus-primary/90 transition-colors duration-200 truncate">
                  {task.title}
                </h3>
                <div className="flex items-center gap-2.5 mt-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-gray-500 bg-white/[0.06] px-2.5 py-0.5 rounded-full tabular-nums">
                    <Clock size={10} />{task.minutes}m
                  </span>
                  {task.fileName && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-focus-primary/60 font-medium bg-focus-primary/8 px-2.5 py-0.5 rounded-full truncate max-w-[140px]">
                      <Paperclip size={10} />{task.fileName}
                    </span>
                  )}
                </div>
              </div>

              {/* Delete — hidden until hover */}
              <button
                onClick={(e) => { e.stopPropagation(); handleDeleteTask(task.id); }}
                className="opacity-0 group-hover:opacity-100 p-2.5 text-white/35 hover:text-red-400 hover:bg-red-500/10 rounded-full btn-press shrink-0"
                title={t('backlog.cancel')}
                aria-label={t('backlog.cancel')}
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Task Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={() => setShowModal(false)}
              />
              <motion.div
                initial={{ transform: 'scale(0.95) translateY(20px)' }}
                animate={{ transform: 'scale(1) translateY(0px)' }}
                exit={{ transform: 'scale(0.95) translateY(20px)' }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="relative w-full max-w-md bg-focus-bg/95 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-white">{t('backlog.newTaskTitle')}</h3>
                  <button onClick={() => setShowModal(false)} aria-label="Close modal" className="text-gray-500 hover:text-white transition-colors">
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleAddTask} className="flex flex-col gap-6">
                  {/* Task name */}
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-2">{t('backlog.taskName')}</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 focus:border-focus-primary/60 rounded-xl px-4 py-3.5 text-white text-[15px] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/40 transition-colors placeholder-gray-600"
                      placeholder="e.g. Write Essay"
                      autoFocus
                      required
                    />
                  </div>

                  {/* Duration — preset pills + custom */}
                  <div>
                    <label className="block text-xs text-gray-500 font-medium mb-2">{t('backlog.duration')}</label>
                    <div className="flex items-center gap-2">
                      {[15, 25, 45, 60].map(preset => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setNewTaskMinutes(preset)}
                          className={`px-4 py-2 rounded-full text-sm font-medium btn-press ${
                            Number(newTaskMinutes) === preset
                              ? 'bg-focus-primary/20 text-focus-primary border border-focus-primary/30'
                              : 'bg-white/5 text-gray-400 border border-transparent hover:bg-white/8 hover:text-gray-300'
                          }`}
                        >
                          {preset}m
                        </button>
                      ))}
                      <input
                        type="number"
                        min="1"
                        max="180"
                        value={newTaskMinutes}
                        onChange={(e) => setNewTaskMinutes(e.target.value)}
                        className="w-16 bg-white/[0.04] border border-white/10 focus:border-focus-primary/60 rounded-full px-3 py-2 text-white text-sm text-center focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-primary/40 transition-colors font-mono"
                        required
                      />
                    </div>
                  </div>

                  {/* Attachment */}
                  <div>
                    <button
                      type="button"
                      onClick={handleSelectFile}
                      className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors py-1"
                    >
                      <Paperclip size={14} />
                      {selectedFile ? selectedFile.name : 'Attach PDF/DOCX (optional)'}
                    </button>
                    {selectedFile && (
                      <div className="mt-2 flex items-center gap-2 bg-focus-primary/8 text-focus-primary/80 px-3 py-2 rounded-lg text-xs font-medium">
                        <Paperclip size={12} />
                        <span className="truncate">{selectedFile.name}</span>
                        <button type="button" onClick={() => setSelectedFile(null)} aria-label="Remove attached file" className="ml-auto hover:text-white shrink-0">
                          <X size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
                    >
                      {t('backlog.cancel')}
                    </button>
                    <button
                      type="submit"
                      disabled={!newTaskTitle.trim() || isSubmitting}
                      className="flex-1 py-3 rounded-full bg-focus-primary hover:bg-focus-primary/85 text-white font-bold text-sm shadow-glow-cta hover:shadow-glow-cta-hover btn-press disabled:opacity-40 disabled:pointer-events-none"
                    >
                      {t('backlog.save')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

export default FocusBacklog;
