/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from "react";
import { Layout, Button } from "antd";
import Post from "./Post";
import { useApolloClient, useSubscription } from "@apollo/react-hooks";
import { POSTS } from "./../../queries/queries";
import { NEW_POST_SUB } from "./../../queries/Subscriptions";
const { Content, Header } = Layout;

const Posts = ({ latestPost }) => {
	const client = useApolloClient();
	const [state, setState] = useState({
		posts: [],
		numberOfNewPosts: 0,
		offset: 0,
		olderAvailable: latestPost ? true : false
	});
	let newestPostId = state.posts.length
		? state.posts[0].id
		: latestPost
		? latestPost.id
		: 0;

	const loadOlder = async () => {
		const { error, data } = await client.query({
			query: POSTS,
			variables: { offset: state.offset }
		});

		if (error) {
			console.log(error);
		}
		if (data.posts.length) {
			// console.log(data);
			setState(state => {
				return {
					...state,
					posts: [...state.posts, ...data.posts],
					offset: state.offset + data.posts.length
				};
			});
		} else {
			setState(state => {
				return { ...state, olderAvailable: false };
			});
		}
	};

	useEffect(() => {
		loadOlder();
	}, []);
	useEffect(() => {
		// console.log(latestPost, newestPostId);
		if (latestPost && latestPost.id > newestPostId) {
			setState(state => {
				return { ...state, numberOfNewPosts: state.numberOfNewPosts + 1 };
			});
			newestPostId = latestPost.id;
		}
		// console.log(state);
	}, [latestPost]);
	// console.log(state);

	const loadNew = () => {
		setState(state => {
			return {
				...state,
				posts: [latestPost, ...state.posts],
				offset: state.offset + state.numberOfNewPosts,
				numberOfNewPosts: 0
			};
		});
	};
	return (
		<div>
			<Header
				className="site-layout-background"
				style={{
					backgroundColor: "#313131",
					textAlign: "end",
					fontSize: 30,
					color: "white"
				}}
			>
				Feed
			</Header>
			{state.numberOfNewPosts > 0 && (
				<div style={{ textAlign: "center" }}>
					<span
						onClick={() => loadNew()}
						className="load-posts"
					>{`${state.numberOfNewPosts} new posts `}</span>
				</div>
			)}
			{state.posts.map(post => (
				<Post key={post.id} post={post} />
			))}
			{/* {state.olderAvailable && ( */}
			<div style={{ textAlign: "center" }}>
				<span
					className="load-posts-older"
					onClick={() => loadOlder()}
				>{`Load older posts `}</span>
			</div>
			{/* )} */}
		</div>
	);
};

const PostsSubscription = () => {
	const { loading, error, data } = useSubscription(NEW_POST_SUB);
	if (loading) {
		return (
			<div>
				<Header
					className="site-layout-background"
					style={{
						backgroundColor: "#313131",
						textAlign: "end",
						fontSize: 30,
						color: "white"
					}}
				>
					Feed
				</Header>
				<Layout className="site-layout">
					<div className="loader">Loading Feed...</div>
				</Layout>
			</div>
		);
	}
	if (error) {
		// console.log(error);
		return (
			<div>
				<Header
					className="site-layout-background"
					style={{
						backgroundColor: "#313131",
						textAlign: "end",
						fontSize: 30,
						color: "white"
					}}
				>
					Feed
				</Header>
				<Layout className="site-layout">
					<div className="loader">Something went left in loading feed</div>
				</Layout>
			</div>
		);
	}
	// console.log(data);
	return <Posts latestPost={data.posts.length ? data.posts[0] : null} />;
};
export default PostsSubscription;