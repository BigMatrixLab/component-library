import { getSnapshot, removeToast, resetToasts, subscribe, toast } from './store';

describe('toast store', () => {
  beforeEach(() => resetToasts());

  it('adds a toast with a generated id and the type it was created with', () => {
    const id = toast.success('Saved', { description: 'All changes stored' });
    const [t] = getSnapshot();
    expect(t).toMatchObject({ id, type: 'success', title: 'Saved', description: 'All changes stored', dismissed: false });
  });

  it('calling with an existing id updates in place and bumps the version', () => {
    toast('First', { id: 'a' });
    toast('Other', { id: 'b' });
    toast.error('Changed', { id: 'a' });
    const list = getSnapshot();
    expect(list.map((t) => t.id)).toEqual(['a', 'b']);
    expect(list[0]).toMatchObject({ type: 'error', title: 'Changed', version: 1 });
  });

  it('dismiss marks toasts as leaving; removeToast drops them', () => {
    const onDismiss = vi.fn();
    toast('One', { id: 'one', onDismiss });
    toast('Two', { id: 'two' });
    toast.dismiss('one');
    expect(getSnapshot().map((t) => t.dismissed)).toEqual([true, false]);
    expect(onDismiss).toHaveBeenCalledTimes(1);
    toast.dismiss('one'); // already leaving: no second callback
    expect(onDismiss).toHaveBeenCalledTimes(1);
    removeToast('one');
    expect(getSnapshot().map((t) => t.id)).toEqual(['two']);
    toast.dismiss();
    expect(getSnapshot().every((t) => t.dismissed)).toBe(true);
  });

  it('updating a leaving toast brings it back', () => {
    toast('Hi', { id: 'x' });
    toast.dismiss('x');
    toast('Hi again', { id: 'x' });
    expect(getSnapshot()[0]).toMatchObject({ dismissed: false, title: 'Hi again' });
  });

  it('notifies subscribers and keeps snapshots stable between changes', () => {
    const listener = vi.fn();
    const off = subscribe(listener);
    toast('A');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getSnapshot()).toBe(getSnapshot());
    off();
    toast('B');
    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe('toast.promise', () => {
    it('morphs one toast: loading, then success with the resolved data', async () => {
      const { id } = toast.promise(Promise.resolve({ name: 'Q3 report' }), {
        loading: 'Exporting…',
        success: (data) => `${data.name} exported`,
        error: 'Export failed',
      });
      expect(getSnapshot()).toHaveLength(1);
      expect(getSnapshot()[0]).toMatchObject({ id, type: 'loading', title: 'Exporting…' });
      await Promise.resolve();
      await Promise.resolve();
      expect(getSnapshot()).toHaveLength(1);
      expect(getSnapshot()[0]).toMatchObject({ id, type: 'success', title: 'Q3 report exported' });
    });

    it('morphs to an error with the rejection', async () => {
      const { unwrap } = toast.promise(Promise.reject(new Error('Disk full')), {
        loading: 'Saving…',
        success: 'Saved',
        error: (e) => ({ title: 'Could not save', description: (e as Error).message }),
      });
      await unwrap().catch(() => {});
      await Promise.resolve();
      expect(getSnapshot()[0]).toMatchObject({ type: 'error', title: 'Could not save', description: 'Disk full' });
    });

    it('leaves a toast the user dismissed while pending dismissed, and runs finally', async () => {
      const done = vi.fn();
      let resolve!: () => void;
      const p = new Promise<void>((r) => (resolve = r));
      const { id } = toast.promise(p, { loading: 'Working…', success: 'Done', finally: done });
      toast.dismiss(id);
      resolve();
      await p;
      await Promise.resolve();
      expect(getSnapshot()[0]).toMatchObject({ type: 'loading', dismissed: true });
      expect(done).toHaveBeenCalled();
    });
  });
});
