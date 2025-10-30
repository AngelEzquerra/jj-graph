// SPDX-FileCopyrightText: 2025 Velociraptor115
//
// SPDX-License-Identifier: LGPL-3.0-only

const std = @import("std");

pub fn main() !void {
    var stdout = std.fs.File.stdout().writer(&.{});
    const allocator = std.heap.page_allocator;

    const args = try std.process.argsAlloc(allocator);
    defer std.process.argsFree(allocator, args);

    const terminationPath = args[1];

    var cwd_buffer: [4096]u8 = undefined;
    const cwd = try std.posix.getcwd(&cwd_buffer);
    try stdout.interface.print("{s}\n", .{cwd});

    while (true) {
        std.fs.accessAbsolute(terminationPath, .{ .mode = .read_only }) catch return;
        std.Thread.sleep(50000);
    }
}
