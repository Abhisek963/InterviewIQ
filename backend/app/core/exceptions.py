from fastapi import HTTPException, status

class InterviewIQException(HTTPException):
    def __init__(self, detail: str, status_code: int = status.HTTP_400_BAD_REQUEST):
        super().__init__(status_code=status_code, detail=detail)

class NotFoundException(InterviewIQException):
    def __init__(self, detail: str = "Resource not found"):
        super().__init__(detail=detail, status_code=status.HTTP_404_NOT_FOUND)

class UnauthorizedException(InterviewIQException):
    def __init__(self, detail: str = "Could not validate credentials"):
        super().__init__(detail=detail, status_code=status.HTTP_401_UNAUTHORIZED)

class ForbiddenException(InterviewIQException):
    def __init__(self, detail: str = "Permission denied for this resource"):
        super().__init__(detail=detail, status_code=status.HTTP_403_FORBIDDEN)

class InvalidStateTransitionException(InterviewIQException):
    def __init__(self, detail: str = "Invalid interview state transition"):
        super().__init__(detail=detail, status_code=status.HTTP_400_BAD_REQUEST)

class ParsingException(InterviewIQException):
    def __init__(self, detail: str = "Failed to parse document"):
        super().__init__(detail=detail, status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
