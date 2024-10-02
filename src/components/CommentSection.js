import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import "./CommentSection.css"; // Make sure to link the new CSS
import close from '../assets/close.svg'; // Close icon

const CommentSection = ({ eventId, user, onClose }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [isClosing, setIsClosing] = useState(false); // Track closing animation state
    const [charCount, setCharCount] = useState(40); // Track the remaining character count

    useEffect(() => {
        const commentsRef = collection(db, "arrangements", eventId, "comments");
        const q = query(commentsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setComments(commentsData);
        });

        return () => unsubscribe();
    }, [eventId]);

    const handleCommentSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            alert("You must be logged in to comment.");
            return;
        }

        if (commentText.trim() === "") {
            alert("Comment cannot be empty.");
            return;
        }

        if (commentText.length > 40) {
            alert("Comment exceeds the 40-character limit.");
            return;
        }

        const commentsRef = collection(db, "arrangements", eventId, "comments");

        try {
            await addDoc(commentsRef, {
                commentText,
                userId: user.uid,
                userName: user.email,
                timestamp: serverTimestamp(),
            });
            setCommentText(""); // Clear input field after submitting
            setCharCount(40); // Reset character count after submitting
        } catch (err) {
            console.error("Error adding comment:", err);
        }
    };

    const handleTextChange = (e) => {
        const inputText = e.target.value;

        // Set the comment text and calculate the remaining character count
        setCommentText(inputText);
        setCharCount(40 - inputText.length); // Update the remaining character count
    };

    // Function to handle the close action with slide-down animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose(); // Trigger the actual close function passed down from parent
            setIsClosing(false); // Reset the closing state
        }, 500); // Duration should match the animation-duration in CSS
    };

    return (
        <div>
            {/* Overlay */}
            <div
                className={`CommentSection-overlay ${isClosing ? "CommentSection-overlay-hide" : ""}`}
                onClick={handleClose}
            ></div>

            {/* Comment Section Panel */}
            <div className={`CommentSection-panel ${isClosing ? "CommentSection-slide-down" : "CommentSection-slide-up"}`}>
                {/* Comment Section Header */}
                <div className="CommentSection-header">
                    <h3>Comments</h3>
                    <button className="CommentSection-close-button" onClick={handleClose}>
                        <img src={close} alt="Close" />
                    </button>
                </div>

                {/* Comment List */}
                <div className="CommentSection-comments">
                    <ul>
                        {comments.map((comment) => (
                            <li key={comment.id} className="CommentSection-comment">
                                <p>{comment.commentText}</p>
                                <small>{new Date(comment.timestamp?.toDate()).toLocaleString()} by {comment.userName}</small>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Comment Form */}
                <div className="CommentSection-form">
                    <textarea
                        value={commentText}
                        onChange={handleTextChange}
                        placeholder="Add a comment..."
                        rows="3"
                        maxLength="40" // Optional, but prevents typing more than 40 characters
                    ></textarea>
                    <div className="char-count">
                        <small>{charCount} characters remaining</small>
                    </div>
                    <div className="commentsubmit">
                        <button onClick={handleCommentSubmit}>Submit</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentSection;
