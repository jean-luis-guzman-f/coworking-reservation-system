using CoworkingReservation.Application.Contract;
using CoworkingReservation.Application.Dtos;
using CoworkingReservation.Domain.Entities;
using CoworkingReservation.Infrastructure.Interfaces;

namespace CoworkingReservation.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users.Select(user => new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        });
    }

    public async Task<UserDto?> GetByIdAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException("User id must be greater than zero.");
        }

        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return null;
        }

        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<UserDto> CreateAsync(UserDto userDto)
    {
        ValidateUser(userDto);

        var user = new User
        {
            FullName = userDto.FullName.Trim(),
            Email = userDto.Email.Trim(),
            PhoneNumber = string.IsNullOrWhiteSpace(userDto.PhoneNumber)
                ? null
                : userDto.PhoneNumber.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        userDto.Id = user.Id;
        userDto.FullName = user.FullName;
        userDto.Email = user.Email;
        userDto.PhoneNumber = user.PhoneNumber;
        userDto.CreatedAt = user.CreatedAt;

        return userDto;
    }

    public async Task<bool> UpdateAsync(int id, UserDto userDto)
    {
        if (id <= 0)
        {
            throw new ArgumentException("User id must be greater than zero.");
        }

        ValidateUser(userDto);

        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return false;
        }

        user.FullName = userDto.FullName.Trim();
        user.Email = userDto.Email.Trim();
        user.PhoneNumber = string.IsNullOrWhiteSpace(userDto.PhoneNumber)
            ? null
            : userDto.PhoneNumber.Trim();

        await _userRepository.UpdateAsync(user);

        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        if (id <= 0)
        {
            throw new ArgumentException("User id must be greater than zero.");
        }

        var user = await _userRepository.GetByIdAsync(id);

        if (user is null)
        {
            return false;
        }

        await _userRepository.DeleteAsync(user);

        return true;
    }

    private static void ValidateUser(UserDto userDto)
    {
        if (userDto is null)
        {
            throw new ArgumentNullException(nameof(userDto));
        }

        if (string.IsNullOrWhiteSpace(userDto.FullName))
        {
            throw new ArgumentException("Full name is required.");
        }

        if (userDto.FullName.Trim().Length < 3)
        {
            throw new ArgumentException(
                "Full name must contain at least 3 characters.");
        }

        if (userDto.FullName.Trim().Length > 150)
        {
            throw new ArgumentException(
                "Full name cannot exceed 150 characters.");
        }

        if (string.IsNullOrWhiteSpace(userDto.Email))
        {
            throw new ArgumentException("Email is required.");
        }

        if (!IsValidEmail(userDto.Email))
        {
            throw new ArgumentException("Email format is invalid.");
        }

        if (userDto.Email.Trim().Length > 150)
        {
            throw new ArgumentException(
                "Email cannot exceed 150 characters.");
        }

        if (!string.IsNullOrWhiteSpace(userDto.PhoneNumber) &&
            userDto.PhoneNumber.Trim().Length > 30)
        {
            throw new ArgumentException(
                "Phone number cannot exceed 30 characters.");
        }
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var mailAddress = new System.Net.Mail.MailAddress(email.Trim());

            return mailAddress.Address.Equals(
                email.Trim(),
                StringComparison.OrdinalIgnoreCase);
        }
        catch
        {
            return false;
        }
    }
}