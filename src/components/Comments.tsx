import { useEffect, useState } from "preact/hooks";
import { studiosAtom, readToAtom } from "../lib/atoms";
import { useAtom } from "jotai";
import { getComments, CommentRepresentation } from "../lib/getComments";
import { getStudioName } from "../lib/getStudioName";
import { formatRelative } from "../lib/formatRelative";
import gobo from "../emoji/gobo.png";
import meow from "../emoji/meow.png";
import waffle from "../emoji/waffle.png";

export function Comments() {
  const [studios] = useAtom(studiosAtom);
  const [comments, setComments] = useState<CommentRepresentation[]>([]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    (async () => {
      setComments(await getComments(studios, page));
    })();
  }, [studios, page]);

  const handlePreviousPage = () => {
    setPage((p) => p - 1);
  };

  const handleNextPage = () => {
    setPage((p) => p + 1);
  };

  return (
    <div class="flex flex-col gap-2">
      <h2 class="text-xl font-bold">
        Comments (
        {page === 0 ? (
          <>&laquo;</>
        ) : (
          <button
            class="font-bold text-sky-600 hover:underline"
            type="button"
            onClick={handlePreviousPage}
          >
            &laquo;
          </button>
        )}{" "}
        {page + 1}{" "}
        {comments.length === 0 ? (
          <>&raquo;</>
        ) : (
          <button
            class="font-bold text-sky-600 hover:underline"
            type="button"
            onClick={handleNextPage}
          >
            &raquo;
          </button>
        )}
        )
      </h2>
      {comments.length === 0 ? (
        <p class="w-full text-lg italic">
          {studios.length === 0
            ? "Add some studios on the left!"
            : page === 0
            ? "There are no comments here."
            : "No comments left."}
        </p>
      ) : (
        comments.map((comment, index) => (
          <Comment key={index} {...comment}></Comment>
        ))
      )}
    </div>
  );
}

function Comment({
  id,
  content,
  datetime_created,
  author,
  reply_count,
  studio,
}: CommentRepresentation) {
  const [readTo, setReadTo] = useAtom(readToAtom);
  const userLink = `https://scratch.mit.edu/users/${author.username}`;
  const emojiContent = content
    .replace(/<img src="\/images\/emoji\/meow.png"/g, `<img src="${meow}"`)
    .replace(/<img src="\/images\/emoji\/gobo.png"/g, `<img src="${gobo}"`)
    .replace(/<img src="\/images\/emoji\/waffle.png"/g, `<img src="${waffle}"`)
    .replace(
      /<img src="\/images\/emoji/g,
      '<img src="https://scratch.mit.edu/images/emoji',
    )
    .replace(/<img/g, '<img class="inline-block max-w-[24px]"');
  const createdDate = new Date(datetime_created);
  const isRead = createdDate.getTime() <= readTo;
  const [studioName, setStudioName] = useState("");

  useEffect(() => {
    (async () => {
      setStudioName(await getStudioName(studio));
    })();
  }, []);

  const handleMarkAsRead = () => {
    setReadTo(createdDate.getTime());
  };

  return (
    <div
      class={`flex w-full items-center gap-2 rounded-xl bg-stone-300 px-2 py-1 ${
        isRead ? "opacity-80" : ""
      }`}
    >
      <a href={userLink}>
        <img
          class="h-12 min-h-[theme(spacing.12)] w-12 min-w-[theme(spacing.12)]"
          src={author.image}
          alt={`${author.username}'s profile picture`}
        />
      </a>
      <div>
        <a href={userLink} class="font-bold text-sky-600 hover:underline">
          {author.username}
        </a>
        <span class="ml-2 italic">{studioName}</span>
        <p
          dangerouslySetInnerHTML={{ __html: emojiContent }}
          style={{ overflowWrap: "anywhere" }}
        ></p>
        <a
          class="font-bold text-sky-600 hover:underline"
          target="_blank"
          href={`https://scratch.mit.edu/studios/${studio}/comments/#comments-${id}`}
        >
          reply ({reply_count}/25)
        </a>{" "}
        -{" "}
        <span title={createdDate.toISOString()}>
          {formatRelative(createdDate)}
        </span>{" "}
        -{" "}
        {isRead ? (
          "Read"
        ) : (
          <button
            class="font-bold text-sky-600 hover:underline"
            type="button"
            onClick={handleMarkAsRead}
          >
            Mark as read
          </button>
        )}
      </div>
    </div>
  );
}
