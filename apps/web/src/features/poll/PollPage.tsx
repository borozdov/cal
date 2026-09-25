import { useEffect } from 'react';
import { useParams } from 'react-router';
import { storage } from '../../lib/storage.js';
import { NotFound } from '../../routes/NotFound.js';
import { usePoll } from './usePoll.js';
import { VoteView } from './VoteView.js';
import { OrganizerView } from './OrganizerView.js';
import { ConfirmedView } from './ConfirmedView.js';

export function PollPage() {
  const { slug = '', adminToken } = useParams<{ slug: string; adminToken?: string }>();
  const { poll, error, reload } = usePoll(slug, adminToken);
  const title = poll?.title;

  useEffect(() => {
    if (!title) return;
    document.title = `${title} — CAL`;
    // An admin link opened on a new device lands in "my meetings" there too.
    if (adminToken) storage.rememberMyPoll({ slug, adminToken, title });
    return () => {
      document.title = 'CAL — планировщик групповых встреч';
    };
  }, [title, slug, adminToken]);

  if (error) return <NotFound message={error} />;
  if (!poll) return null;
  if (poll.confirmed) return <ConfirmedView poll={poll} adminToken={adminToken} onChange={reload} />;
  if (adminToken) return <OrganizerView poll={poll} adminToken={adminToken} onChange={reload} />;
  return <VoteView poll={poll} onSaved={reload} />;
}
