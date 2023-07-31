import { initializeApp } from "firebase/app";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getFirestore,
  getDoc,
  deleteDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytes,
  deleteObject,
  listAll,
  uploadBytesResumable,
} from "firebase/storage";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  deleteUser,
  updateEmail,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth";
import { con } from "./Conf.js";
export const app = initializeApp(con);
export const DB = getFirestore(app);
export const auth = getAuth(app);
const storage = getStorage(app);

export const UPLOADVIDEO = async (path, photo, onProgress) => {
  const storageRef = ref(storage, path);
  const uploadTask = uploadBytesResumable(storageRef, photo);

  // Subscribe to the "state_changed" event to track the upload progress
  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      onProgress(progress); // Pass the progress value to the provided onProgress callback
    },
    (error) => {
      throw new Error(`Error uploading photo: ${error.message}`);
    }
  );

  try {
    await uploadTask; // Wait for the upload to complete
    const url = await getDownloadURL(uploadTask.snapshot.ref);
    return url;
  } catch (error) {
    throw new Error(`Error getting download URL: ${error.message}`);
  }
};

export const UPLOADPHOTO = async (path, photo) => {
  const snapshot = await uploadBytes(ref(storage, path), photo);
  const url = await getDownloadURL(snapshot.ref);
  return url;
};
export const EMPTYFOLDER = async (path) => {
  const listRef = ref(storage, path);
  listAll(listRef)
    .then((res) => {
      res.items.forEach((itemRef) => {
        deleteObject(itemRef);
      });
    })
    .catch((error) => {
      console.log(error);
    });
};
export const DELETEPHOTO = async (path) => {
  await deleteObject(ref(storage, path));
};

export const UPDATEEMAIL = async (newEmail = "") => {
  try {
    onAuthStateChanged(auth, (user) => {
      updateEmail(user, newEmail);
    });
    return "Email updated successfully";
  } catch (error) {
    throw new Error(error.message);
  }
};
export const CURRENTUSER = () => {
  return { ...auth.currentUser };
};
export const SIGNOUT = async () => {
  signOut(auth)
    .then(() => {
      // Sign-out successful.
    })
    .catch((error) => {
      console.log(error);
    });
};

export const LOGIN = async (Email, Password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      Email,
      Password
    );
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const UPDATEPROFILE = async (user, properties, currentUser) => {
  const targetUser = currentUser ? auth.currentUser : user;
  try {
    if (!targetUser) {
      throw new Error("User not found"); // Throw an error if the user is not available
    }

    await updateProfile(targetUser, properties);
    return auth.currentUser;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const NEWUSER = async (Email, Password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      Email,
      Password
    );
    const user = userCredential.user;
    return user;
  } catch (error) {
    throw new Error(error.message);
  }
};
export const ADMINDELETE = async (id) => {
  const userToDelete = await GETDOC("users", id);
  await SETDOC("users", id, {
    ...userToDelete,
    deleteUser: true,
    Username: "",
  });
  try {
    return "user Deleted";
    // eslint-disable-next-line no-unreachable
  } catch (error) {
    throw error.message;
  }
};
export const DELETECURRENTUSER = async () => {
  const user = auth.currentUser;
  deleteUser(user).catch((error) => {
    console.log(error);
  });
};
export const RESETPASSWORD = (email) => {
  sendPasswordResetEmail(auth, email)
    .then(() => {
      // Email sent.
      return "Email Sent";
    })
    .catch((error) => {
      throw error.message;
    });
};

//      GETDOC("users", user.id).then((value) => { });
export function encrypt(str) {
  let shift = 3;
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90) {
      result += String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
    } else if (charCode >= 97 && charCode <= 122) {
      result += String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}

// Decryption function
export function decrypt(str) {
  let shift = 3;
  let result = "";
  for (let i = 0; i < str.length; i++) {
    let charCode = str.charCodeAt(i);
    if (charCode >= 65 && charCode <= 90) {
      result += String.fromCharCode(((charCode - 65 - shift + 26) % 26) + 65);
    } else if (charCode >= 97 && charCode <= 122) {
      result += String.fromCharCode(((charCode - 97 - shift + 26) % 26) + 97);
    } else {
      result += str.charAt(i);
    }
  }
  return result;
}
export const GETCOLLECTION = async (target) => {
  try {
    const cleanData = [];
    const srcData = await getDocs(collection(DB, target));
    srcData.forEach((doc) => {
      const info = doc.data();
      cleanData.push(info);
    });
    return cleanData;
  } catch (error) {
    return error;
  }
};
export const GETDOC = async (collection = String, id = Number) => {
  try {
    const docSnap = await getDoc(doc(DB, collection, id.toString()));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return "Error";
    }
  } catch (error) {
    return error;
  }
};
export const SETDOC = async (
  collection = String,
  id = Number,
  newValue = Object,
  New = ""
) => {
  if (New) {
    await setDoc(doc(DB, collection, id.toString()), newValue);
  }
  const res = await GETDOC(collection, id);
  if (res === "Error") {
    throw new Error(`No data found`);
  } else {
    await setDoc(doc(DB, collection, id.toString()), newValue);
  }
};
//         SETDOC("users", tempData.id, { ...tempData });

export const DELETEDOC = async (collection = String, id = Number) => {
  try {
    await deleteDoc(doc(DB, collection, id.toString()));
  } catch (error) {
    console.log(error);
  }
};

export const REALTIME = (collection, id, setData) => {
  const docRef = doc(DB, collection, id);
  const unsubscribe = onSnapshot(docRef, (snapshot) => {
    setData(snapshot.data());
  });

  return unsubscribe;
};
export const UPDATEDOC = async (collection = String, id, newData = Object) => {
  try {
    await updateDoc(doc(DB, collection, id.toString()), newData);
  } catch (error) {
    console.log(error);
  }
};
export const QUERY = async (collectionName, propertyInDB, operation, value) => {
  try {
    const q = query(
      collection(DB, collectionName),
      where(propertyInDB, operation, value)
    );

    const querySnapshot = await getDocs(q);

    const matches = [];

    querySnapshot.forEach((doc) => {
      matches.push(doc.data());
    });

    return matches;
  } catch (error) {
    console.error("Error during query:", error);
    throw new Error("Error during query");
  }
};
