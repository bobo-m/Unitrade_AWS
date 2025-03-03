const db = require("../config/mysql_database"); // Assuming you're using MySQL pool

// // Function to update pending coins for a user
// async function updatePendingCoins(userId, coins) {
//   const query = `
//         UPDATE user_data
//         SET pending_coin = pending_coin + ?
//         WHERE id = ?`;
//   const params = [coins, userId]; // Use array for positional parameters
//   await mysqlPool.execute(query, params);
//   console.log(`Added ${coins} pending coins to User ID: ${userId}`);
// }

// // Function to distribute coins to parents and ancestors up to 18 levels
// async function distributeCoinsToParents(parentId, level = 1) {
//   if (level > 18 || parentId === null) {
//     return;
//   }

//   // Add 5 pending coins to the parent at this level
//   await updatePendingCoins(parentId, 5);
//   console.log(
//     `Added 5 pending coins to User ID: ${parentId} at Level: ${level}`
//   );

//   // Get parent's parent and repeat up to 18 levels
//   const query = `SELECT parent_id FROM user_data WHERE id = ?`;
//   const [rows] = await mysqlPool.execute(query, [parentId]); // Use array for parameters
//   const parent = rows[0];

//   if (parent && parent.parent_id) {
//     await distributeCoinsToParents(parent.parent_id, level + 1);
//   }
// }

// // Function to check if a user has both left and right children
// async function hasBothChildren(userId) {
//   const query = `SELECT leftchild_id, rightchild_id FROM user_data WHERE id = ?`;
//   const [rows] = await mysqlPool.execute(query, [userId]); // Use array for parameters
//   const user = rows[0];
//   return user && user.leftchild_id !== null && user.rightchild_id !== null;
// }

// // Function to find the next available parent
// async function findNextAvailableParent() {
//   // Initialize a queue with the root user
//   const rootQuery = `SELECT id FROM user_data WHERE parent_id IS NULL`;
//   const [rootRows] = await mysqlPool.execute(rootQuery);
//   const root = rootRows[0];

//   if (!root) {
//     return null; // If no root exists, return null
//   }

//   const queue = [];
//   queue.push(root.id);

//   while (queue.length > 0) {
//     const currentParentId = queue.shift();

//     // Check if current parent has less than two children
//     const parentQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE id = ?`;
//     const [parentRows] = await mysqlPool.execute(parentQuery, [
//       currentParentId,
//     ]);
//     const parent = parentRows[0];

//     if (!parent) {
//       console.log(`Parent with ID ${currentParentId} not found.`);
//       continue; // Skip if parent not found
//     }

//     if (parent.leftchild_id === null || parent.rightchild_id === null) {
//       console.log(`Available parent found: ID ${currentParentId}`);
//       return currentParentId; // Return current parent ID with available slot
//     }

//     // Enqueue left and right children
//     if (parent.leftchild_id !== null) {
//       queue.push(parent.leftchild_id);
//       console.log(`Enqueued left child ID: ${parent.leftchild_id}`);
//     }
//     if (parent.rightchild_id !== null) {
//       queue.push(parent.rightchild_id);
//       console.log(`Enqueued right child ID: ${parent.rightchild_id}`);
//     }
//   }

//   return null; // All parents have two children
// }

// // Function to find available parent by referral code
// async function findAvailableParentByReferral(referralCode) {
//   console.log(
//     `Looking for available parent for referral code: ${referralCode}`
//   );

//   // Fetch the user based on the referral code
//   const userQuery = `SELECT id as parent_id FROM user_data WHERE referral_code = ?`;
//   const [userRows] = await mysqlPool.execute(userQuery, [referralCode]);

//   // Check if the referred user exists
//   let currentUser = userRows[0];
//   if (!currentUser) {
//     console.log(`Referred user with referral_code ${referralCode} not found.`);
//     return null; // No user found for the given referral code
//   }

//   console.log("Found referred user:", currentUser);

//   // Traverse the parent-child hierarchy
//   while (currentUser) {
//     const userId = currentUser.parent_id;

//     if (!userId || userId === 0) {
//       console.log("Invalid or null parent_id. Breaking the loop.");
//       break;
//     }

//     console.log(`Checking user ID ${userId} for available slots...`);

//     // Check the user's children for available slots
//     const childQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE id = ?`;
//     const [childRows] = await mysqlPool.execute(childQuery, [userId]);
//     const user = childRows[0];

//     if (!user) {
//       console.log(`User with ID ${userId} not found in child records.`);
//       break;
//     }

//     // Check for available slots
//     if (user.leftchild_id === null) {
//       console.log(`Available slot found: Left child of User ID ${userId}`);
//       return { parentId: userId, position: "leftchild_id" };
//     }

//     if (user.rightchild_id === null) {
//       console.log(`Available slot found: Right child of User ID ${userId}`);
//       return { parentId: userId, position: "rightchild_id" };
//     }

//     // Move up to the parent if no slots are found
//     const parentQuery = `SELECT id, parent_id FROM user_data WHERE id = ?`;
//     const [parentRows] = await mysqlPool.execute(parentQuery, [userId]);
//     currentUser = parentRows[0];

//     if (!currentUser) {
//       console.log(`No parent found for User ID ${userId}.`);
//       break;
//     }
//   }

//   console.log(
//     `No available slot found in the referral chain for referral_code ${referralCode}.`
//   );
//   return null;
// }

// module.exports = {
//   updatePendingCoins,
//   findAvailableParentByReferral,
//   findNextAvailableParent,
//   distributeCoinsToParents,
//   hasBothChildren,
// };

exports.hasBothChildren = async (userId) => {
  const query = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
  const [rows] = await db.query(query, [userId]);
  const user = rows[0];
  return user && user.leftchild_id !== null && user.rightchild_id !== null;
};

exports.findNextAvailableParent = async () => {
  const rootQuery = `SELECT user_id FROM user_data WHERE parent_id IS NULL`;
  const [rootRows] = await db.query(rootQuery);
  const root = rootRows[0];

  if (!root) return null;

  const queue = [root.user_id];
  while (queue.length > 0) {
    const currentParentId = queue.shift();
    const parentQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
    const [parentRows] = await db.query(parentQuery, [currentParentId]);

    if (!parentRows.length) continue;

    const parent = parentRows[0];
    if (
      parent &&
      (parent.leftchild_id === null || parent.rightchild_id === null)
    ) {
      return currentParentId; // Return the parent ID if one child slot is free
    }

    if (parent.leftchild_id !== null) queue.push(parent.leftchild_id);
    if (parent.rightchild_id !== null) queue.push(parent.rightchild_id);
  }

  return null; // No available parent found
};

exports.findAvailableParentByReferral = async (referralCode) => {
  const userQuery = `SELECT user_id as parent_id FROM user_data WHERE referral_code = ?`;
  const [userRows] = await db.query(userQuery, [referralCode]);
  console.log("User query result:", userRows);

  let currentUser = userRows[0];
  console.log("Searching for parent using referral code:", referralCode);

  while (currentUser) {
    const userId = currentUser.parent_id;
    if (!userId) break;
    const childQuery = `SELECT leftchild_id, rightchild_id FROM user_data WHERE user_id = ?`;
    const [childRows] = await db.query(childQuery, [userId]);
    console.log("aaaaaa", childRows);
    if (!childRows.length) {
      break;
    }

    const user = childRows[0];

    // Check if either child slot is free
    if (user.leftchild_id === null || user.rightchild_id === null) {
      console.log("Found available parent:", userId);
      return {
        parentId: userId,
        position: user.leftchild_id === null ? "leftchild_id" : "rightchild_id",
      };
    }

    const parentQuery = `SELECT user_id, parent_id FROM user_data WHERE id = ?`;
    const [parentRows] = await db.query(parentQuery, [userId]);
    currentUser = parentRows[0];
  }

  console.log("No available parent found for referral code:", referralCode);
  return null;
};



