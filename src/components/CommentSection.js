import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import "./CommentSection.css"; // Make sure to link the new CSS
import close from '../assets/close.svg'; // Close icon
import deleteIcon from '../assets/DeleteNotFilled.svg'; // Delete icon
import defaultProfilePic from '../assets/ProfileGrey.svg'; // Default profile picture
import { formatDistanceToNow } from 'date-fns'; // Library to format timestamps (install via npm if needed)

const CommentSection = ({ eventId, user, onClose }) => {
    const [commentText, setCommentText] = useState("");
    const [comments, setComments] = useState([]);
    const [usersData, setUsersData] = useState({}); // To store user profile data
    const [isClosing, setIsClosing] = useState(false); // Track closing animation state
    const [charCount, setCharCount] = useState(40); // Track the remaining character count

    useEffect(() => {
        // Fetch comments
        const commentsRef = collection(db, "arrangements", eventId, "comments");
        const q = query(commentsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const commentsData = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
            setComments(commentsData);
        });

        // Fetch user profile data (assuming it's stored in a users collection)
        const usersRef = collection(db, "users");
        const unsubscribeUsers = onSnapshot(usersRef, (snapshot) => {
            const usersDataObj = snapshot.docs.reduce((acc, doc) => {
                acc[doc.id] = doc.data();
                return acc;
            }, {});
            setUsersData(usersDataObj);
        });

        return () => {
            unsubscribe();
            unsubscribeUsers();
        };
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

    const handleDeleteComment = async (commentId) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            try {
                const commentDocRef = doc(db, "arrangements", eventId, "comments", commentId);
                await deleteDoc(commentDocRef);
                console.log("Comment deleted successfully.");
            } catch (err) {
                console.error("Error deleting comment:", err);
            }
        }
    };

    const getUserProfileImage = (userId) => {
        // Use profileImageUrl from Firestore, falling back to a default avatar if not available
        return usersData[userId]?.profileImageUrl || '/default-avatar.png'; // Default if no picture is available
    };

    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        return formatDistanceToNow(new Date(timestamp.seconds * 1000)) + ' ago'; // Display time ago
    };

    return (
        <div>
            {/* Overlay */}
            <div
                className={`CommentSection-overlay ${isClosing ? "CommentSection-overlay-hide" : ""}`}
                onClick={() => {
                    setIsClosing(true);
                    setTimeout(() => {
                        onClose(); // Close the comment section
                        setIsClosing(false); // Reset state after animation
                    }, 500);
                }}
            ></div>

            {/* Comment Section Panel */}
            <div className={`CommentSection-panel ${isClosing ? "CommentSection-slide-down" : "CommentSection-slide-up"}`}>
                {/* Comment Section Header */}
                <div className="CommentSection-header">
                    <h3>Comments</h3>
                    <button className="CommentSection-close-button" onClick={onClose}>
                        <img src={close} alt="Close" />
                    </button>
                </div>

                {/* Comment List */}
                <div className="CommentSection-comments">
                    <ul>
                        {comments.map((comment) => (
                            <li key={comment.id} className="CommentSection-comment">
                                <div className="comment-profile">
                                    <div
                                        className="comment-profile-img"
                                        style={{
                                            background: usersData[comment.userId]?.profileBackgroundColor || '#f0f0f0', // Fallback background color
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: '50%',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {usersData[comment.userId]?.profileImageUrl ? (
                                            <span className="comment-avatar-emoji">{usersData[comment.userId].profileImageUrl}</span>
                                        ) : (
                                            <img src={defaultProfilePic} alt="Profile" />
                                        )}
                                    </div>
                                    <div className="comment-info">
                                        <div className="comment-header">
                                            <span className="comment-username">{comment.userName}</span>
                                            <span className="comment-timestamp">{formatTimestamp(comment.timestamp)}</span>
                                        </div>
                                        <p className="comment-text">{comment.commentText}</p>
                                    </div>
                                    {/* Show delete button only for the user's own comments */}
                                    {comment.userId === user.uid && (
                                        <button
                                            className="CommentSection-delete-button"
                                            onClick={() => handleDeleteComment(comment.id)}
                                        >
                                            <img src={deleteIcon} alt="Delete" />
                                        </button>
                                    )}
                                </div>
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
