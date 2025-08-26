import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;

void main() async {
  print("===== Login =====");
  stdout.write("Username: ");
  String? username = stdin.readLineSync()?.trim();
  stdout.write("Password: ");
  String? password = stdin.readLineSync()?.trim();

  if (username == null || password == null) {
    print("Incomplete input");
    return;
  }

  final loginUrl = Uri.parse('http://localhost:3000/login');
  final loginRes = await http.post(
    loginUrl,
    headers: {"Content-Type": "application/json"},
    body: jsonEncode({"username": username, "password": password}),
  );

  if (loginRes.statusCode != 200) {
    print("Login failed: ${loginRes.body}");
    return;
  }

  final loginObj = json.decode(loginRes.body) as Map<String, dynamic>;
  if (!(loginObj['success'] ?? false)) {
    print("Invalid credentials");
    return;
  }

  final int userId = loginObj['userId'];

  while (true) {
    print("\n========= Expense Tracking App =========");
    print("1. Show all expenses");
    print("2. Today's expenses");
    print("3. Search expense");
    print("4. Add new expense");
    print("5. Delete an expense");
    print("6. Exit");
    stdout.write("Choose: ");

    String? choice = stdin.readLineSync();

    if (choice == "1") {
      await showAllExpenses(userId);
    } else if (choice == "2") {
      await showTodaysExpenses(userId);
    } else if (choice == "3") {
      await searchExpense(userId);
    } else if (choice == "4") {
      await addExpense(userId);
    } else if (choice == "5") {
      await deleteExpense(userId);
    } else if (choice == "6") {
      print("------ Bye -------");
      break;
    } else {
      print("Invalid choice");
    }
  }
}

Future<void> showAllExpenses(int userId) async {
  final expUrl = Uri.parse('http://localhost:3000/expenses/$userId');
  final expRes = await http.get(expUrl);

  if (expRes.statusCode == 200) {
    final expenses = json.decode(expRes.body) as List;
    int total = 0;
    print("------------- All expenses -----------");
    for (var e in expenses) {
      print("${e['id']}. ${e['item']} : ${e['paid']}฿ : ${e['date']}");
      total += (e['paid'] as num).toInt();
    }
    print("Total expenses = $total฿");
  } else {
    print("Error: ${expRes.body}");
  }
}
Future<void> showTodaysExpenses(int userId) async {
  final expUrl = Uri.parse('http://localhost:3000/expenses/$userId/today');
  final expRes = await http.get(expUrl);

  if (expRes.statusCode == 200) {
    final expenses = json.decode(expRes.body) as List;
    int total = 0;
    print("------------- Today's expenses -----------");
    for (var e in expenses) {
      print("${e['id']}. ${e['item']} : ${e['paid']}฿ : ${e['date']}");
      total += (e['paid'] as num).toInt();
    }
    print("Total expenses = $total฿");
  } else {
    print("Error: ${expRes.body}");
  }
}
Future<void> searchExpense(int userId) async {
  stdout.write("Item to search: ");
  String? keyword = stdin.readLineSync();

  if (keyword == null || keyword.isEmpty) {
    print("No keyword entered");
    return;
  }

  final searchUrl = Uri.parse('http://localhost:3000/expenses/$userId/search?keyword=$keyword');
  final res = await http.get(searchUrl);

  if (res.statusCode == 200) {
    final expenses = json.decode(res.body) as List;
    if (expenses.isEmpty) {
      print("No item: '$keyword'");
    } else {
      for (var e in expenses) {
        print("${e['id']}. ${e['item']} : ${e['paid']}฿ : ${e['date']}");
      }
    }
  } else {
    print("Error: ${res.body}");
  }
}
addExpense(userId){}
deleteExpense(userId){}