import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import useInput from "../../hooks/useInput";
import st from "./SignUpST";
import { fetchCheckNickname, fetchSignUp } from "../../api/signUp";
import { ApiResponse, ErrorResponse } from "../../types/apiType";
import { User } from "../../types/userType";
import useToggle from "../../hooks/useToggle";
import UserId from "./UserId";

function SignUp() {
  // 아이디, 비밀번호, 닉네임, 성별, 나이 입력값 state
  const [userId, , setUserId, userIdRef] = useInput("");
  const [isIdUnique, , setIsIdUnique] = useToggle(false);
  const [password, handleChangePassword, , passwordRef] = useInput("");
  const [passwordCheck, handleChangePasswordCheck, , passwordCheckRef] =
    useInput("");
  const [nickname, handleChangeNickname, , nicknameRef] = useInput("");
  const [isNicknameUnique, , setIsNicknameUnique] = useToggle(false);
  const [activeGender, setActiveGender] = useState("");
  const userGenderRef = useRef<HTMLButtonElement>(null);
  const [agreeGender, handleAgreeGender, setAgreeGender] = useToggle(false);
  const [activeAge, setActiveAge] = useState("");
  const [isAgreeForAge, handleIsAgreeForAge, setIsAgreeForAge] =
    useToggle(false);

  // 아이디, 비밀번호, 닉네임, 성별, 연령대 에러 메세지 상태
  const [userIdError, setUserIdError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordCheckError, setPasswordCheckError] = useState("");
  const [nicknameError, setNicknameError] = useState("");
  const [genderError, setGenderError] = useState("");
  const [ageError, setAgeError] = useState("");

  // 네비게이트 생성
  const navigate = useNavigate();

  // 성별과 연령대 정보 배열
  const genders = ["남", "여"];
  const ages = ["10대(성인)", "20대", "30대", "40대", "50대", "60대 이상"];

  // 아이디 입력 핸들러
  const handleIdChange = (newId: string) => {
    setUserId(newId);
  };

  // 아이디 유효성 검사
  useEffect(() => {
    const idPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!!userId && !idPattern.test(userId)) {
      setUserIdError("올바르지 않은 아이디 형식입니다.");
      return;
    }
    if (userId && !isIdUnique) {
      setUserIdError("아이디 중복을 확인하세요.");
      return;
    }
    if (!!userId && !!isIdUnique) {
      setUserIdError("사용 가능한 아이디입니다.");
    }
  }, [userId]);

  // 닉네임 중복검사 뮤테이션 함수
  const { mutate: mutateCheckNickname } = useMutation(fetchCheckNickname, {
    onSuccess: (response) => {
      if (response === "닉네임 중복 검사 성공") {
        setIsNicknameUnique(true);
        return;
      }
      if (response === "중복된 닉네임 입니다.") {
        setIsNicknameUnique(false);
        setNicknameError("중복된 닉네임입니다.");
      }
    },
    onError: (error) => {
      console.log("실패", error);
    },
  });

  // 닉네임 중복 검사
  const handleCheckNicknameBtnClick = () => {
    mutateCheckNickname(nickname);
  };

  // 닉네임 유효성 검사
  useEffect(() => {
    const nicknamePattern = /^[\dA-Za-z가-힣]{3,8}$/;
    const specCharPattern = /[\p{P}\p{S}\s]+/u;
    if (!nickname) {
      setNicknameError("");
    }
    if (nickname && specCharPattern.test(nickname)) {
      setNicknameError("특수문자는 허용되지 않습니다.");
      return;
    }
    if (nickname && !nicknamePattern.test(nickname)) {
      setNicknameError("한글/영문의 3~8자로 입력하세요.");
      return;
    }
    if (nickname && !isNicknameUnique) {
      setNicknameError("닉네임 중복을 확인하세요.");
    }
    if (nickname && isNicknameUnique) {
      setNicknameError("사용 가능한 닉네임입니다.");
    }
  }, [nickname, isNicknameUnique]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    const passwordPattern =
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d_!?@#$%^&*]{5,12}$/;
    if (!!password && !passwordPattern.test(password)) {
      setPasswordError("5~12자 이내의 영문,숫자 조합을 입력하세요.");
      return;
    }
    if (password) {
      setPasswordError("");
    }
  }, [password]);

  // 비밀번호 일치 검사
  useEffect(() => {
    if (!password) {
      setPasswordError("");
    }
    if (!passwordCheck) {
      setPasswordCheckError("");
    }
    if (!!passwordCheck && passwordCheck !== password) {
      setPasswordCheckError("비밀번호가 일치하지 않습니다.");
    }
    if (!!password && passwordCheck === password) {
      setPasswordCheckError("비밀번호가 일치합니다.");
    }
  }, [password, passwordCheck]);

  // 성별 선택값 유효성 검사
  useEffect(() => {
    if (activeGender) {
      setGenderError("");
      return;
    }
    if (agreeGender) {
      setGenderError("");
    }
  }, [activeGender, agreeGender]);

  // 성별 클릭 핸들러, 성별 정보 제공 핸들러
  const handleGenderClick = (gender: string) => {
    if (gender === "남") {
      setActiveGender("male");
    } else setActiveGender("female");
  };
  const handleAgreeForGender = () => {
    handleAgreeGender();
  };

  // 연령 유효성 검사
  useEffect(() => {
    if (activeAge) {
      setAgeError("");
      return;
    }
    if (isAgreeForAge) {
      setGenderError("");
    }
  }, [activeAge, isAgreeForAge]);

  // 연령 클릭 핸들러, 연령 정보 제공 핸들러
  const handleAgeClick = (age: string) => {
    setActiveAge(age);
  };
  const handleAgreeForAge = () => {
    handleIsAgreeForAge();
  };

  // 회원가입 api 응답 성공시 핸들링 함수
  function handleApiResponse<T>(response: ApiResponse<T>) {
    if (response.status === 200) {
      alert("회원가입이 완료되었습니다!");
    } else {
      console.log("여기서 출력", response);
    }
  }

  // 회원가입 api 응답 실패시 핸들링 함수
  const handleApiError = (error: ErrorResponse) => {
    const message = error?.data;
    throw message;
  };

  // 회원가입 뮤테이션 함수
  const { mutate: mutateSignUp } = useMutation(fetchSignUp, {
    onSuccess: handleApiResponse,
    onError: handleApiError,
  });

  // 회원가입 버튼 클릭시
  const handleSignUpBtnClick = () => {
    // 아이디 값이 없거나 중복검사를 완료하지 않았거나 중복된 아이디일 경우
    if (!userId) {
      userIdRef.current?.focus();
      setUserIdError("아이디를 입력하세요.");
      return;
    }
    if (!isIdUnique) {
      userIdRef.current?.focus();
      return;
    }

    // 닉네임 값이 없거나 중복검사를 완료하지 않았거나 중복된 닉네임일 경우
    if (!nickname || !isNicknameUnique) {
      nicknameRef.current?.focus();
      return;
    }

    // 비밀번호 값이 없거나 비밀번호가 일치하지 않을 경우
    if (!password) {
      passwordRef.current?.focus();
      return;
    }
    if (passwordCheckError !== "비밀번호가 일치합니다.") {
      passwordCheckRef.current?.focus();
      return;
    }

    // 성별 값이 없거나 정보 제공에 동의하지 않은 경우
    if (!activeGender) {
      userGenderRef.current?.focus();
      setGenderError("성별을 선택해주세요.");
      return;
    }
    if (!agreeGender) {
      setGenderError("성별 정보 제공에 동의해주세요.");
      return;
    }

    // 연령 값이 없거나 정보 제공에 동의하지 않은 경우
    if (!activeAge) {
      setAgeError("연령을 선택해주세요.");
      return;
    }
    if (!isAgreeForAge) {
      setAgeError("연령 정보 제공에 동의해주세요.");
      return;
    }

    const user: User = {
      userId,
      password,
      gender: activeGender,
      ageRange: activeAge,
      nickname,
      agreeForGender: true,
      agreeForAge: true,
    };
    mutateSignUp(user);
    alert("회원가입이 완료되었습니다!");
    navigate("/");
  };

  return (
    <st.ContainerForm
      onSubmit={(e: React.FormEvent<HTMLFormElement>) => e.preventDefault()}
    >
      <st.FormExplainText pageName="signUpPage">
        회원가입에 필요한 정보를 입력해주세요.
      </st.FormExplainText>
      <st.SignUpExplainText>*는 필수 기입 사항입니다.</st.SignUpExplainText>
      <st.UserInfoContainer>
        <UserId
          pageName="signUpPage"
          onIdChange={handleIdChange}
          idRef={userIdRef}
          signUpIdError={userIdError}
          setIsIdUnique={setIsIdUnique}
        />
        <label htmlFor="userNickname">
          <st.IdAreaExplainText>*닉네임 설정</st.IdAreaExplainText>
          <st.IdAreaContainer>
            <st.CommonInput
              type="text"
              value={nickname}
              onChange={handleChangeNickname}
              ref={nicknameRef}
              id="userNickname"
              placeholder="닉네임은 8자 이내로 입력해 주세요."
              aria-describedby="userNicknameError"
              maxLength={8}
              size={28}
            />
            <st.OriginalButton
              type="submit"
              onClick={handleCheckNicknameBtnClick}
            >
              중복 확인
            </st.OriginalButton>
          </st.IdAreaContainer>
        </label>
        <st.CommonErrorText role="alert" id="userNicknameError">
          {nicknameError}
        </st.CommonErrorText>
        <div>
          <label htmlFor="userPassword">
            <st.IdAreaExplainText>*비밀번호 설정</st.IdAreaExplainText>
            <st.CommonInput
              type="password"
              value={password}
              onChange={handleChangePassword}
              ref={passwordRef}
              id="userPassword"
              placeholder="비밀번호를 입력해 주세요."
              aria-describedby="userPasswordError"
              maxLength={12}
            />
          </label>
          <st.CommonErrorText role="alert" id="userPasswordError">
            {passwordError}
          </st.CommonErrorText>
        </div>
        <div>
          <label htmlFor="userPasswordCheck">
            <st.IdAreaExplainText>*비밀번호 확인</st.IdAreaExplainText>
            <st.CommonInput
              type="password"
              value={passwordCheck}
              onChange={handleChangePasswordCheck}
              ref={passwordCheckRef}
              id="userPasswordCheck"
              placeholder="비밀번호를 확인해 주세요."
              aria-describedby="passwordCheckError"
              maxLength={12}
            />
          </label>
          <st.CommonErrorText role="alert" id="passwordCheckError">
            {passwordCheckError}
          </st.CommonErrorText>
        </div>
        <st.GenderAriaContainer>
          <st.IdAreaExplainText>*성별</st.IdAreaExplainText>
          <st.GenderLabelContainer htmlFor="isAgreeForGender">
            {genders.map((gender) => (
              <st.GenderButton
                ref={userGenderRef}
                key={gender}
                type="button"
                onClick={() => handleGenderClick(gender)}
                active={activeGender === (gender === "남" ? "male" : "female")}
              >
                {gender}
              </st.GenderButton>
            ))}
          </st.GenderLabelContainer>
          <label>
            <st.CommonAgreeForInfoInput
              type="checkbox"
              id="isAgreeForGender"
              onChange={handleAgreeForGender}
              aria-describedby="agreeForGenderError"
            />
            <st.CommonAgreeForInfoText>
              (필수)개인정보 이용 및 제 3자 제공에 동의합니다.
            </st.CommonAgreeForInfoText>
            <st.CommonErrorText role="alert" id="agreeForGenderError">
              {genderError}
            </st.CommonErrorText>
          </label>
        </st.GenderAriaContainer>
        <div>
          <st.IdAreaExplainText>*연령</st.IdAreaExplainText>
          <st.AgeAriaContainer htmlFor="isAgreeForAge">
            {ages.map((age) => (
              <st.AgeButton
                key={age}
                type="button"
                onClick={() => handleAgeClick(age)}
                active={activeAge === age}
              >
                {age}
              </st.AgeButton>
            ))}
          </st.AgeAriaContainer>
          <label>
            <st.CommonAgreeForInfoInput
              type="checkbox"
              id="isAgreeForAge"
              onChange={handleAgreeForAge}
              aria-describedby="agreeForAgeError"
            />
            <st.CommonAgreeForInfoText>
              (필수)개인정보 이용 및 제 3자 제공에 동의합니다.
            </st.CommonAgreeForInfoText>
            <st.CommonErrorText role="alert" id="agreeForAgeError">
              {ageError}
            </st.CommonErrorText>
          </label>
        </div>
      </st.UserInfoContainer>
      <st.OriginalButton type="submit" onClick={handleSignUpBtnClick}>
        가입하기
      </st.OriginalButton>
    </st.ContainerForm>
  );
}

export default SignUp;
